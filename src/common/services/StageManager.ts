import { Stages } from '@interfaces/Stages'
import { UserStage } from '@interfaces/UserStage'

class StageManager {
    readonly #userStages: UserStage[]

    constructor() {
        this.#userStages = []
    }

    isUserInStage(userId: number, stage: Stages): boolean {
        return this.#userStages.some((item) => {
            return item.userId === userId && item.stage === stage
        })
    }

    setStageForUser(userId: number, stage: Stages, stageData = {}) {
        const userInStage = this.#getUserInStage(userId)

        if (userInStage) {
            userInStage.stage = stage
            userInStage.stageData = stageData
        } else {
            this.#userStages.push({ userId, stage, stageData })
        }
    }

    getUserStageData(userId: number): any | undefined {
        const userInStage = this.#getUserInStage(userId)

        if (userInStage) {
            return Object.assign({}, userInStage.stageData)
        }

        return undefined
    }

    #getUserInStage(userId: number): UserStage | undefined {
        return this.#userStages.find((item) => {
            return item.userId === userId
        })
    }
}

const stageManager = new StageManager()

export default stageManager
