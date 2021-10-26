export type Stages = 'start' | 'photos-to-pdf' | 'voice-to-mp3'

export interface UserStage {
    userId: number
    stage: Stages
}
