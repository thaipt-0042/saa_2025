export interface UserSearchResult {
  id: string
  full_name: string | null
  avatar_url: string | null
}

export interface HashtagItem {
  id: string
  name: string
}

export type ImageUploadStatus = 'uploading' | 'done' | 'error'

export interface ImageUploadState {
  file: File
  url: string
  status: ImageUploadStatus
}

export interface KudoPayload {
  recipientId: string
  content: string
  hashtags: string[]
  imageUrls: string[]
  isAnonymous: boolean
  anonymousDisplayName: string | null
}

export interface Kudo {
  id: string
  senderId: string
  recipientId: string
  content: string
  hashtags: string[]
  imageUrls: string[]
  isAnonymous: boolean
  anonymousDisplayName: string | null
  createdAt: string
}
