export interface KudoSender {
  id: string
  fullName: string | null
  avatarUrl: string | null
  department: string | null
  starCount: number
}

export interface KudoPost {
  id: string
  sender: KudoSender
  recipient: KudoSender
  content: string
  hashtags: Array<{ id: string; name: string }>
  imageUrls: string[]
  likeCount: number
  likedByCurrentUser: boolean
  senderIsCurrentUser: boolean
  createdAt: string
}

export interface LiveBoardFilters {
  hashtagId: string | null
  department: string | null
}

export interface LiveBoardStats {
  kudosReceived: number
  kudosSent: number
  heartsReceived: number
  secretBoxesOpened: number
  secretBoxesUnopened: number
}

export interface SunnerActivity {
  userId: string
  fullName: string | null
  avatarUrl: string | null
  description: string
}

export interface SpotlightNode {
  userId: string
  fullName: string
  kudosReceived: number
  latestKudoAt: string
}

export interface KudosPage {
  items: KudoPost[]
  nextCursor: string | null
}

export function computeStarCount(kudosReceived: number): number {
  if (kudosReceived >= 50) return 3
  if (kudosReceived >= 20) return 2
  if (kudosReceived >= 10) return 1
  return 0
}
