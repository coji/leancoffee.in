import { Dayjs } from 'dayjs'

export interface User {
  uid: string
  photoURL: string
  displayName: string
}

export interface Meeting {
  id: string
  workspaceId: string
  workspaceName: string
  title: string
  description: string
  guests: string[]
  accessLevel: 'workspace' | 'private' | 'public'
  numOfArchives?: number
  updatedAt: string
  createdAt: string
  createUser?: User
}

export interface Workspace {
  id: string
  name: string
  meetings: Meeting[]
}

export interface Topic {
  id: string
  title: string
  attachments: string[]
  note: string | null
  status: 'candidate' | 'now' | 'done' | 'archive' | 'delete'
  voters: string[]
  archiveId?: string
  updatedAt?: Dayjs
  createdAt?: Dayjs
  startAt?: Dayjs
  doneAt?: Dayjs
  deletedAt?: Dayjs
  createUser?: User
}

export interface Archive {
  id: string
  title: string
  createUser: User
  createdAt: Dayjs
  updatedAt: Dayjs
  deletedAt?: Dayjs
}
