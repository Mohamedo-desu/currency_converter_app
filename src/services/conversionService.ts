import { getStoredValues, saveSecurely } from "@/store/storage";
import { AppState } from "react-native";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL + "/api" || "http://localhost:3000/api";

export interface ConversionData {
  deviceId: string;
  deviceInfo: any;
  fromCurrency: string;
  toCurrency: string;
  fromFlag: string;
  toFlag: string;
  originalAmount: number;
  convertedAmount: number;
  exchangeRate: number;
  fromRate: number;
  toRate: number;
  formattedAmount: string;
  formattedConverted: string;
  timestamp: string;
}

class ConversionBatchService {
  private static instance: ConversionBatchService;
  private pendingConversions: ConversionData[] = [];
  private batchTimeout: ReturnType<typeof setTimeout> | null = null;
  private isProcessing = false;

  // Configuration
  private readonly BATCH_SIZE = 20; // Maximum conversions per batch
  private readonly BATCH_DELAY = 5000; // 5 seconds delay before sending batch
  private readonly STORAGE_KEY = "pendingConversions";

  private constructor() {
    this.loadPendingConversions();
    this.setupAppStateListener();
  }

  public static getInstance(): ConversionBatchService {
    if (!ConversionBatchService.instance) {
      ConversionBatchService.instance = new ConversionBatchService();
    }
    return ConversionBatchService.instance;
  }

  /**
   * Add a conversion to the batch queue
   */
  public addConversion(conversion: ConversionData): void {
    this.pendingConversions.push(conversion);
    this.savePendingConversions();

    // Clear existing timeout and set a new one
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    // If we've reached the batch size, send immediately
    if (this.pendingConversions.length >= this.BATCH_SIZE) {
      this.processBatch();
    } else {
      // Otherwise, schedule for later
      this.batchTimeout = setTimeout(() => {
        this.processBatch();
      }, this.BATCH_DELAY);
    }
  }

  /**
   * Force process all pending conversions immediately
   */
  public async flushPendingConversions(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    if (this.pendingConversions.length > 0) {
      await this.processBatch();
    }
  }

  /**
   * Check for pending conversions on app start and process them
   */
  public async processPendingOnStartup(): Promise<void> {
    if (this.pendingConversions.length > 0) {
      console.log(
        `Found ${this.pendingConversions.length} pending conversions on startup`
      );
      await this.processBatch();
    }
  }

  /**
   * Get the number of pending conversions
   */
  public getPendingCount(): number {
    return this.pendingConversions.length;
  }

  /**
   * Load pending conversions from storage
   */
  private loadPendingConversions(): void {
    try {
      const storedData = getStoredValues([this.STORAGE_KEY]);
      if (storedData[this.STORAGE_KEY]) {
        this.pendingConversions = JSON.parse(storedData[this.STORAGE_KEY]);
      }
    } catch (error) {
      console.error("Error loading pending conversions:", error);
      this.pendingConversions = [];
    }
  }

  /**
   * Save pending conversions to storage
   */
  private savePendingConversions(): void {
    try {
      saveSecurely([
        {
          key: this.STORAGE_KEY,
          value: JSON.stringify(this.pendingConversions),
        },
      ]);
    } catch (error) {
      console.error("Error saving pending conversions:", error);
    }
  }

  /**
   * Process the current batch of conversions
   */
  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.pendingConversions.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const conversionsToSend = [...this.pendingConversions];
      console.log(
        `Processing batch of ${conversionsToSend.length} conversions`
      );

      const response = await fetch(`${API_BASE_URL}/conversions/track/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversions: conversionsToSend,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(
          `Successfully sent ${result.savedCount} conversions to backend`
        );

        // Clear the successfully sent conversions
        this.pendingConversions = [];
        this.savePendingConversions();
      } else {
        const errorData = await response.json();
        console.error("Failed to send conversions batch:", errorData);

        // If it's a validation error, we might want to remove invalid conversions
        if (response.status === 400 && errorData.validCount !== undefined) {
          console.log(
            `${errorData.validCount} out of ${errorData.totalCount} conversions were valid`
          );
          // For now, we'll keep all conversions and retry later
          // In a more sophisticated implementation, you could remove invalid ones
        }
      }
    } catch (error) {
      console.error("Error sending conversions batch:", error);
      // Keep the conversions for retry later
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Setup app state listener to flush on background/foreground changes
   */
  private setupAppStateListener(): void {
    // This will be called when the app goes to background or becomes inactive
    // We'll flush pending conversions to ensure they're not lost
    try {
      if (typeof document !== "undefined") {
        // Web environment
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "hidden") {
            this.flushPendingConversions();
          }
        });

        window.addEventListener("beforeunload", () => {
          this.flushPendingConversions();
        });
      } else {
        // React Native environment
        try {
          AppState.addEventListener("change", (nextAppState: string) => {
            if (nextAppState === "background" || nextAppState === "inactive") {
              this.flushPendingConversions();
            }
          });
        } catch (error) {
          console.log(
            "AppState not available, skipping app state listener setup"
          );
        }
      }
    } catch (error) {
      console.error("Error setting up app state listener:", error);
    }
  }

  /**
   * Clear all pending conversions (useful for testing or manual cleanup)
   */
  public clearPendingConversions(): void {
    this.pendingConversions = [];
    this.savePendingConversions();
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }
}

// Export singleton instance
export const conversionBatchService = ConversionBatchService.getInstance();

// Export the class for testing purposes
export { ConversionBatchService };
