import { conversionBatchService } from "@/services/conversionService";
import { useEffect } from "react";

/**
 * Hook to manage conversion batching lifecycle
 * Handles startup processing and cleanup
 */
export const useConversionBatching = () => {
  useEffect(() => {
    // Process any pending conversions on mount
    const processPendingConversions = async () => {
      try {
        await conversionBatchService.processPendingOnStartup();
      } catch (error) {
        console.error(
          "Error processing pending conversions on startup:",
          error
        );
      }
    };

    processPendingConversions();

    // Cleanup on unmount
    return () => {
      conversionBatchService.flushPendingConversions();
    };
  }, []);

  // Return useful functions and state
  return {
    addConversion: conversionBatchService.addConversion.bind(
      conversionBatchService
    ),
    flushPending: conversionBatchService.flushPendingConversions.bind(
      conversionBatchService
    ),
    getPendingCount: conversionBatchService.getPendingCount.bind(
      conversionBatchService
    ),
    clearPending: conversionBatchService.clearPendingConversions.bind(
      conversionBatchService
    ),
  };
};
