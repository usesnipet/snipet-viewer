import { KnowledgeBase, KnowledgeSource, KnowledgeSourceVersion } from "../types/knowledge";

const MOCK_SOURCES: KnowledgeSource[] = [
  {
    id: "src-1",
    name: "Documentation S3",
    description: "Main product documentation stored in S3",
    status: "ACTIVE",
    type: "S3",
    methods: ["RAG"],
    config: JSON.stringify({ bucket: "docs-prod", region: "us-east-1" }, null, 2),
    ragConfig: JSON.stringify({ chunkSize: 1000, overlap: 200 }, null, 2),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "src-2",
    name: "Customer Support API",
    description: "Real-time support tickets via API",
    status: "ACTIVE",
    type: "API",
    methods: ["SEARCH"],
    config: JSON.stringify({ endpoint: "https://api.support.com/v1" }, null, 2),
    searchConfig: JSON.stringify({ limit: 5, threshold: 0.7 }, null, 2),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_BASES: KnowledgeBase[] = [
  {
    id: "base-1",
    name: "Product Intelligence",
    description: "Base for all product-related knowledge",
    sourceIds: ["src-1", "src-2"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_VERSIONS: KnowledgeSourceVersion[] = [
  {
    id: "v-1",
    version: 1,
    latest: false,
    releasedAt: new Date(Date.now() - 86400000).toISOString(),
    knowledgeSourceId: "src-1",
  },
  {
    id: "v-2",
    version: 2,
    latest: true,
    releasedAt: new Date().toISOString(),
    knowledgeSourceId: "src-1",
  },
];

export class KnowledgeService {
  private static bases = [...MOCK_BASES];
  private static sources = [...MOCK_SOURCES];
  private static versions = [...MOCK_VERSIONS];

  static async getSchemas() {
    return [
      {
        type: "S3",
        configSchema: {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "title": "S3 Storage",
          "description": "Configure connection to Amazon S3 or S3-compatible storage",
          "required": [
            "bucket",
            "clientConfig"
          ],
          "properties": {
            "bucket": {
              "type": "string",
              "minLength": 1,
              "title": "Bucket",
              "description": "Name of the S3 bucket to read objects from"
            },
            "prefix": {
              "type": "string",
              "title": "Prefix",
              "description": "Optional path prefix to filter objects (e.g. 'docs/')"
            },
            "maxKeys": {
              "type": "integer",
              "minimum": 1,
              "maximum": 1000,
              "title": "Max keys per page",
              "description": "Maximum number of objects to list per request (default: 100)"
            },
            "searchMaxPages": {
              "type": "integer",
              "minimum": 1,
              "title": "Max search pages",
              "description": "Maximum number of pages to paginate when listing objects"
            },
            "clientConfig": {
              "type": "object",
              "title": "Client configuration",
              "description": "AWS credentials and region settings",
              "required": [
                "region",
                "credentials"
              ],
              "properties": {
                "region": {
                  "type": "string",
                  "minLength": 1,
                  "title": "Region",
                  "description": "AWS region (e.g. us-east-1)"
                },
                "credentials": {
                  "type": "object",
                  "title": "Credentials",
                  "description": "Access key and secret for S3 authentication",
                  "required": [
                    "accessKeyId",
                    "secretAccessKey"
                  ],
                  "properties": {
                    "accessKeyId": {
                      "type": "string",
                      "minLength": 1,
                      "title": "Access Key ID",
                      "description": "AWS access key ID"
                    },
                    "secretAccessKey": {
                      "type": "string",
                      "minLength": 1,
                      "title": "Secret Access Key",
                      "description": "AWS secret access key"
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        type: "API",
        configSchema: {
          type: "object",
          title: "REST API",
          required: ["endpoint"],
          properties: {
            endpoint: { type: "string", title: "Endpoint URL" },
            method: { type: "string", title: "HTTP Method", enum: ["GET", "POST"], default: "GET" },
            headers: { type: "string", title: "Headers (JSON String)" },
          }
        }
      }
    ];
  }

  static async getBases() {
    return this.bases;
  }

  static async getSources() {
    return this.sources;
  }

  static async getVersions(sourceId: string) {
    return this.versions.filter(v => v.knowledgeSourceId === sourceId);
  }

  static async createBase(data: Omit<KnowledgeBase, "id" | "createdAt" | "updatedAt">) {
    const newBase: KnowledgeBase = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.bases.push(newBase);
    return newBase;
  }

  static async updateBase(id: string, data: Partial<KnowledgeBase>) {
    this.bases = this.bases.map(b => b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b);
  }

  static async deleteBase(id: string) {
    this.bases = this.bases.filter(b => b.id !== id);
  }

  static async createSource(data: Omit<KnowledgeSource, "id" | "createdAt" | "updatedAt">) {
    const newSource: KnowledgeSource = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.sources.push(newSource);
    
    // Create initial version
    this.versions.push({
      id: Math.random().toString(36).substr(2, 9),
      version: 1,
      latest: true,
      releasedAt: new Date().toISOString(),
      knowledgeSourceId: newSource.id,
    });

    return newSource;
  }

  static async updateSource(id: string, data: Partial<KnowledgeSource>) {
    this.sources = this.sources.map(s => s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s);
  }

  static async setLatestVersion(sourceId: string, versionId: string) {
    this.versions = this.versions.map(v => {
      if (v.knowledgeSourceId === sourceId) {
        return { ...v, latest: v.id === versionId };
      }
      return v;
    });
  }
}
