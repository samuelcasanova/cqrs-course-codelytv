import { CreateVideoCommand } from '../../src/video/application/CreateVideoCommand'
import { CreateVideoCommandHandler } from '../../src/video/application/CreateVideoCommandHandler'
import { Video } from '../../src/video/domain/Video'
import { SearchAllVideosQueryHandler } from '../../src/video/application/SearchAllVideosQueryHandler'
import type { EventBus } from '../../src/shared/domain/EventBus'
import { SearchAllVideosQuery } from '../../src/video/application/SearchAllVideosQuery'
import type { VideosResponse } from '../../src/video/application/VideosResponse'

const videoIdValue = '0ab2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'
const videoTitleValue = 'Hello world'

const repository = {
  save: jest.fn(),
  searchAll: jest.fn()
}

class SpyEventBus implements EventBus {
  private publishAllCallCount = 0

  publish (event: any): void {
  }

  publishAll (events: any[]): void {
    this.publishAllCallCount++
  }

  publishAllHasBeenCalledOnce (): boolean {
    return this.publishAllCallCount === 1
  }
}

const eventBus = new SpyEventBus()

describe('Video', () => {
  it('should create a video', async () => {
    const createVideoCommand = givenaUserWantsToCreateaVideo()
    await whenTheVideoIsCreated(createVideoCommand)
    thenItsSavedInTheRepositoryAndAnEventIsPublished()
  })

  it('should retrieve all stored videos', async () => {
    givenaVideoIsInTheRepository()
    const videosResponse = await whenaUserSearchsForAllVideos()
    thenTheyFindTheVideo(videosResponse)
  })
})

function thenTheyFindTheVideo (videosResponse: VideosResponse): void {
  expect(repository.searchAll).toHaveBeenCalled()
  expect(videosResponse.videos).toHaveLength(1)
}

async function whenaUserSearchsForAllVideos (): Promise<VideosResponse> {
  const query = new SearchAllVideosQuery()
  const handler = new SearchAllVideosQueryHandler(repository)
  return await handler.ask(query)
}

function givenaVideoIsInTheRepository (): void {
  (repository.searchAll).mockResolvedValue([Video.fromPrimitives(videoIdValue, videoTitleValue)])
}

function thenItsSavedInTheRepositoryAndAnEventIsPublished (): void {
  expect(repository.save).toHaveBeenCalled()
  expect(eventBus.publishAllHasBeenCalledOnce()).toBe(true)
}

async function whenTheVideoIsCreated (createVideoCommand: CreateVideoCommand): Promise<void> {
  const handler = new CreateVideoCommandHandler(repository, eventBus)
  await handler.handle(createVideoCommand)
}

function givenaUserWantsToCreateaVideo (): CreateVideoCommand {
  return new CreateVideoCommand(videoIdValue, videoTitleValue)
}
