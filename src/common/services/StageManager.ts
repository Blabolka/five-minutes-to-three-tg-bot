import { Stages, UserStage } from '@interfaces/UserStage'

class StageManager {
    #userStages: UserStage[]

    constructor() {
        this.#userStages = []
    }

    isUserInStage(userId: number, stage: Stages): boolean {
        return this.#userStages.some((item) => {
            return item.userId === userId && item.stage === stage
        })
    }

    setStateForUser(userId: number, stage: Stages) {
        const userInStage = this.#getUserInStage(userId)

        if (!userInStage) {
            this.#userStages.push({ userId, stage })
        } else {
            userInStage.stage = stage
        }
    }

    #getUserInStage(userId: number): UserStage | undefined {
        return this.#userStages.find((item) => {
            return item.userId === userId
        })
    }
}

const stageManager = new StageManager()

export default stageManager
