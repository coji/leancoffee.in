import * as dayjs from 'dayjs'
import {
  QueryDocumentSnapshot,
  SnapshotOptions,
  DocumentData
} from 'firebase/firestore'
import { Topic } from '~/interfaces/model'

export const topicConverter = {
  toFirestore(topic: Topic): DocumentData {
    return topic
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    _options: SnapshotOptions
  ): Topic {
    const { createdAt, updatedAt, startAt, doneAt, deletedAt, ...contents } =
      snapshot.data()
    return {
      id: snapshot.id,
      createdAt: createdAt?.seconds
        ? dayjs.unix(createdAt?.seconds)
        : undefined,
      updatedAt: updatedAt?.seconds
        ? dayjs.unix(updatedAt?.seconds)
        : undefined,
      startAt: startAt?.seconds ? dayjs.unix(startAt?.seconds) : undefined,
      doneAt: doneAt?.seconds ? dayjs.unix(doneAt?.seconds) : undefined,
      deletedAt: deletedAt?.seconds
        ? dayjs.unix(deletedAt?.seconds)
        : undefined,
      ...contents
    } as Topic
  }
}
