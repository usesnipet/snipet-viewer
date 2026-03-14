import { EmbeddingProfile } from "../types/embedding";
import { KnowledgeService } from "./knowledge-service";

const MOCK_PROFILES: EmbeddingProfile[] = [
  {
    id: "prof-1",
    name: "Standard OpenAI Profile",
    status: "ACTIVE",
    splitterSettings: JSON.stringify({ strategy: "recursive", chunkSize: 1000, chunkOverlap: 200 }, null, 2),
    preProcessorSettings: JSON.stringify({ removeStopWords: true, lowercase: true }, null, 2),
    llmId: "llm-2",
    createdAt: new Date().toISOString(),
  },
];

export class EmbeddingService {
  private static profiles = [...MOCK_PROFILES];

  static async getProfiles() {
    return this.profiles;
  }

  static async getProfileById(id: string) {
    return this.profiles.find(p => p.id === id);
  }

  static async createProfile(data: Omit<EmbeddingProfile, "id" | "createdAt">) {
    const newProfile: EmbeddingProfile = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    this.profiles.push(newProfile);
    return newProfile;
  }

  static async updateProfile(id: string, data: Partial<EmbeddingProfile>) {
    this.profiles = this.profiles.map(p => p.id === id ? { ...p, ...data } : p);
  }

  static async deleteProfile(id: string) {
    this.profiles = this.profiles.filter(p => p.id !== id);
  }

  static async getLinkedSourcesCount(profileId: string) {
    const sources = await KnowledgeService.getSources();
    return sources.filter(s => s.embeddingProfileId === profileId).length;
  }
}
