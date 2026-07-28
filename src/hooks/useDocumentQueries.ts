import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createDocument, getDocuments, type CreateDocumentInput } from '../services/documentService'
import { queryKeys } from './queryKeys'

export function useDocumentsQuery(jobId: string | undefined) {
  return useQuery({ queryKey: queryKeys.documents(jobId ?? ''), queryFn: () => getDocuments(jobId ?? ''), enabled: Boolean(jobId) })
}

export function useCreateDocumentMutation(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateDocumentInput) => createDocument(input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.documents(jobId) }),
  })
}
