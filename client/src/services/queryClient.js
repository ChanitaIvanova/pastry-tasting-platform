import { QueryClient } from 'react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

export const queryKeys = {
  questionnaires: 'questionnaires',
  questionnaire: (id) => ['questionnaire', id],
  responses: (questionnaireId) => ['responses', questionnaireId],
  statistics: (questionnaireId) => ['statistics', questionnaireId]
}; 