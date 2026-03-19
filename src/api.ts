/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Snipet Core API
 * @version 1.0.0
 *
 * API documentation for Snipet Core
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Health check endpoint
     *
     * @tags Health
     * @name HealthList
     * @request GET:/api/health
     */
    healthList: (params: RequestParams = {}) =>
      this.request<
        {
          status: string;
        },
        any
      >({
        path: `/api/health`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Version endpoint
     *
     * @tags System
     * @name VersionList
     * @request GET:/api/version
     */
    versionList: (params: RequestParams = {}) =>
      this.request<
        {
          version: string;
        },
        any
      >({
        path: `/api/version`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description List all embedding processes
     *
     * @tags Embedding Processes
     * @name EmbeddingProcessesList
     * @request GET:/api/embedding-processes/
     */
    embeddingProcessesList: (
      query?: {
        skip?: number;
        take?: number;
        order?: string;
        /**
         * @format uuid
         * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
         */
        embeddingProfileId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          metadata: any;
          processedAt: string;
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          embeddingProfileId: string;
        }[],
        {
          error: string;
        }
      >({
        path: `/api/embedding-processes/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Create an embedding process
     *
     * @tags Embedding Processes
     * @name EmbeddingProcessesCreate
     * @request POST:/api/embedding-processes/
     */
    embeddingProcessesCreate: (
      data: {
        metadata: any;
        /**
         * @format uuid
         * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
         */
        embeddingProfileId: string;
        processedAt?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          metadata: any;
          processedAt: string;
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          embeddingProfileId: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/embedding-processes/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get an embedding process by ID
     *
     * @tags Embedding Processes
     * @name EmbeddingProcessesDetail
     * @request GET:/api/embedding-processes/{id}
     */
    embeddingProcessesDetail: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          metadata: any;
          processedAt: string;
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          embeddingProfileId: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/embedding-processes/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Update an embedding process
     *
     * @tags Embedding Processes
     * @name EmbeddingProcessesPartialUpdate
     * @request PATCH:/api/embedding-processes/{id}
     */
    embeddingProcessesPartialUpdate: (
      id: string,
      data: {
        metadata?: any;
        /**
         * @format uuid
         * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
         */
        embeddingProfileId?: string;
        processedAt?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          metadata: any;
          processedAt: string;
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          embeddingProfileId: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/embedding-processes/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete an embedding process
     *
     * @tags Embedding Processes
     * @name EmbeddingProcessesDelete
     * @request DELETE:/api/embedding-processes/{id}
     */
    embeddingProcessesDelete: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          metadata: any;
          processedAt: string;
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          embeddingProfileId: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/embedding-processes/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * @description List splitter config schemas
     *
     * @tags Embedding Profiles
     * @name EmbeddingProfilesSplitterSchemaList
     * @request GET:/api/embedding-profiles/splitter-schema
     */
    embeddingProfilesSplitterSchemaList: (
      query?: {
        targetId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          scope: string;
          targetId: string;
          schema: Partial<Record<string, any>>;
          encryptedFields: string[];
        }[],
        {
          error: string;
        }
      >({
        path: `/api/embedding-profiles/splitter-schema`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description List all embedding profiles
     *
     * @tags Embedding Profiles
     * @name EmbeddingProfilesList
     * @request GET:/api/embedding-profiles/
     */
    embeddingProfilesList: (
      query?: {
        skip?: number;
        take?: number;
        order?: string;
        name?: string;
        status?: "ACTIVE" | "DEPRECATED";
        /**
         * @format uuid
         * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
         */
        llmId?: string;
        includeLLM?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          status: "ACTIVE" | "DEPRECATED";
          createdAt: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          splitterType: string;
          splitterSettings: Partial<Record<string, any>>;
          preProcessorSettings: {
            toASCII?: boolean;
            removeNewlines?: boolean;
            removeWhitespace?: boolean;
            trim?: boolean;
            lowercase?: boolean;
            uppercase?: boolean;
          };
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          llmId: string;
        }[],
        {
          error: string;
        }
      >({
        path: `/api/embedding-profiles/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Create an embedding profile
     *
     * @tags Embedding Profiles
     * @name EmbeddingProfilesCreate
     * @request POST:/api/embedding-profiles/
     */
    embeddingProfilesCreate: (
      data: {
        /**
         * @minLength 1
         * @maxLength 255
         */
        name: string;
        status: "ACTIVE" | "DEPRECATED";
        /**
         * @minLength 1
         * @maxLength 255
         */
        splitterType: string;
        splitterSettings: Partial<Record<string, any>>;
        preProcessorSettings: {
          toASCII?: boolean;
          removeNewlines?: boolean;
          removeWhitespace?: boolean;
          trim?: boolean;
          lowercase?: boolean;
          uppercase?: boolean;
        };
        /**
         * @format uuid
         * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
         */
        llmId: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          status: "ACTIVE" | "DEPRECATED";
          createdAt: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          splitterType: string;
          splitterSettings: Partial<Record<string, any>>;
          preProcessorSettings: {
            toASCII?: boolean;
            removeNewlines?: boolean;
            removeWhitespace?: boolean;
            trim?: boolean;
            lowercase?: boolean;
            uppercase?: boolean;
          };
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          llmId: string;
        },
        | {
            error: string;
            details: {
              instancePath: string;
              schemaPath: string;
              message?: string;
              params?: Partial<Record<string, any>>;
            }[];
          }
        | {
            error: string;
          }
      >({
        path: `/api/embedding-profiles/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get an embedding profile by ID
     *
     * @tags Embedding Profiles
     * @name EmbeddingProfilesDetail
     * @request GET:/api/embedding-profiles/{id}
     */
    embeddingProfilesDetail: (
      id: string,
      query?: {
        includeLLM?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          status: "ACTIVE" | "DEPRECATED";
          createdAt: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          splitterType: string;
          splitterSettings: Partial<Record<string, any>>;
          preProcessorSettings: {
            toASCII?: boolean;
            removeNewlines?: boolean;
            removeWhitespace?: boolean;
            trim?: boolean;
            lowercase?: boolean;
            uppercase?: boolean;
          };
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          llmId: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/embedding-profiles/${id}`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Update an embedding profile
     *
     * @tags Embedding Profiles
     * @name EmbeddingProfilesPartialUpdate
     * @request PATCH:/api/embedding-profiles/{id}
     */
    embeddingProfilesPartialUpdate: (
      id: string,
      data: {
        /**
         * @minLength 1
         * @maxLength 255
         */
        name?: string;
        status?: "ACTIVE" | "DEPRECATED";
        /**
         * @minLength 1
         * @maxLength 255
         */
        splitterType?: string;
        splitterSettings?: Partial<Record<string, any>>;
        preProcessorSettings?: {
          toASCII?: boolean;
          removeNewlines?: boolean;
          removeWhitespace?: boolean;
          trim?: boolean;
          lowercase?: boolean;
          uppercase?: boolean;
        };
        /**
         * @format uuid
         * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
         */
        llmId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          status: "ACTIVE" | "DEPRECATED";
          createdAt: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          splitterType: string;
          splitterSettings: Partial<Record<string, any>>;
          preProcessorSettings: {
            toASCII?: boolean;
            removeNewlines?: boolean;
            removeWhitespace?: boolean;
            trim?: boolean;
            lowercase?: boolean;
            uppercase?: boolean;
          };
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          llmId: string;
        },
        | {
            error: string;
            details: {
              instancePath: string;
              schemaPath: string;
              message?: string;
              params?: Partial<Record<string, any>>;
            }[];
          }
        | {
            error: string;
          }
      >({
        path: `/api/embedding-profiles/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete an embedding profile
     *
     * @tags Embedding Profiles
     * @name EmbeddingProfilesDelete
     * @request DELETE:/api/embedding-profiles/{id}
     */
    embeddingProfilesDelete: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          status: "ACTIVE" | "DEPRECATED";
          createdAt: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          splitterType: string;
          splitterSettings: Partial<Record<string, any>>;
          preProcessorSettings: {
            toASCII?: boolean;
            removeNewlines?: boolean;
            removeWhitespace?: boolean;
            trim?: boolean;
            lowercase?: boolean;
            uppercase?: boolean;
          };
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          llmId: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/embedding-profiles/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * @description List all knowledge bases
     *
     * @tags Knowledge Bases
     * @name KnowledgeBasesList
     * @request GET:/api/knowledge-bases/
     */
    knowledgeBasesList: (
      query?: {
        skip?: number;
        take?: number;
        order?: string;
        name?: string;
        description?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          description: string | null;
          createdAt: string;
          updatedAt: string;
        }[],
        {
          error: string;
        }
      >({
        path: `/api/knowledge-bases/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a new knowledge base
     *
     * @tags Knowledge Bases
     * @name KnowledgeBasesCreate
     * @request POST:/api/knowledge-bases/
     */
    knowledgeBasesCreate: (
      data: {
        /**
         * @minLength 1
         * @maxLength 255
         */
        name: string;
        description?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          description: string | null;
          createdAt: string;
          updatedAt: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/knowledge-bases/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a knowledge base by ID
     *
     * @tags Knowledge Bases
     * @name KnowledgeBasesDetail
     * @request GET:/api/knowledge-bases/{id}
     */
    knowledgeBasesDetail: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          description: string | null;
          createdAt: string;
          updatedAt: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/knowledge-bases/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Update a knowledge base
     *
     * @tags Knowledge Bases
     * @name KnowledgeBasesPartialUpdate
     * @request PATCH:/api/knowledge-bases/{id}
     */
    knowledgeBasesPartialUpdate: (
      id: string,
      data: {
        /**
         * @minLength 1
         * @maxLength 255
         */
        name?: string;
        description?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          description: string | null;
          createdAt: string;
          updatedAt: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/knowledge-bases/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Soft-delete a knowledge base
     *
     * @tags Knowledge Bases
     * @name KnowledgeBasesDelete
     * @request DELETE:/api/knowledge-bases/{id}
     */
    knowledgeBasesDelete: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          description: string | null;
          createdAt: string;
          updatedAt: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/knowledge-bases/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * @description List sources of a knowledge base
     *
     * @tags Knowledge Bases
     * @name KnowledgeBasesSourcesList
     * @request GET:/api/knowledge-bases/{id}/sources
     */
    knowledgeBasesSourcesList: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          description: string | null;
          status: "ACTIVE" | "ARCHIVED";
          config: Partial<Record<string, any>>;
          type: "s3";
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          embeddingProfileId: string;
          createdAt: string;
          updatedAt: string;
        }[],
        {
          error: string;
        }
      >({
        path: `/api/knowledge-bases/${id}/sources`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Add a source to a knowledge base
     *
     * @tags Knowledge Bases
     * @name KnowledgeBasesSourcesCreate
     * @request POST:/api/knowledge-bases/{id}/sources/{sourceId}
     */
    knowledgeBasesSourcesCreate: (
      id: string,
      sourceId: string,
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          description: string | null;
          createdAt: string;
          updatedAt: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/knowledge-bases/${id}/sources/${sourceId}`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * @description Remove a source from a knowledge base
     *
     * @tags Knowledge Bases
     * @name KnowledgeBasesSourcesDelete
     * @request DELETE:/api/knowledge-bases/{id}/sources/{sourceId}
     */
    knowledgeBasesSourcesDelete: (
      id: string,
      sourceId: string,
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          description: string | null;
          createdAt: string;
          updatedAt: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/knowledge-bases/${id}/sources/${sourceId}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * @description List all knowledge sources
     *
     * @tags Knowledge Sources
     * @name KnowledgeSourcesList
     * @request GET:/api/knowledge-sources/
     */
    knowledgeSourcesList: (
      query?: {
        skip?: number;
        take?: number;
        order?: string;
        name?: string;
        description?: string;
        status?: "ACTIVE" | "ARCHIVED";
        type?: "s3";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          description: string | null;
          status: "ACTIVE" | "ARCHIVED";
          config: Partial<Record<string, any>>;
          type: "s3";
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          embeddingProfileId: string;
          createdAt: string;
          updatedAt: string;
        }[],
        {
          error: string;
        }
      >({
        path: `/api/knowledge-sources/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a knowledge source
     *
     * @tags Knowledge Sources
     * @name KnowledgeSourcesCreate
     * @request POST:/api/knowledge-sources/
     */
    knowledgeSourcesCreate: (
      data: {
        /**
         * @minLength 1
         * @maxLength 255
         */
        name: string;
        description: string | null;
        config: Partial<Record<string, any>>;
        type: "s3";
        sync?: {
          mode: "pull" | "push";
          cronExpression?: string | null;
          webhookEnabled?: boolean;
          isActive?: boolean;
        };
        embeddingProfile?: {
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          status: "ACTIVE" | "DEPRECATED";
          /**
           * @minLength 1
           * @maxLength 255
           */
          splitterType: string;
          splitterSettings: Partial<Record<string, any>>;
          preProcessorSettings: {
            toASCII?: boolean;
            removeNewlines?: boolean;
            removeWhitespace?: boolean;
            trim?: boolean;
            lowercase?: boolean;
            uppercase?: boolean;
          };
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          llmId: string;
        };
        /**
         * @format uuid
         * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
         */
        embeddingProfileId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          description: string | null;
          status: "ACTIVE" | "ARCHIVED";
          config: Partial<Record<string, any>>;
          type: "s3";
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          embeddingProfileId: string;
          createdAt: string;
          updatedAt: string;
        },
        | {
            error: string;
            details: {
              instancePath: string;
              schemaPath: string;
              message?: string;
              params?: Partial<Record<string, any>>;
            }[];
          }
        | {
            error: string;
          }
      >({
        path: `/api/knowledge-sources/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description List knowledge sources with versions
     *
     * @tags Knowledge Sources
     * @name KnowledgeSourcesWithVersionsList
     * @request GET:/api/knowledge-sources/with-versions
     */
    knowledgeSourcesWithVersionsList: (
      query?: {
        skip?: number;
        take?: number;
        order?: string;
        name?: string;
        description?: string;
        status?: "ACTIVE" | "ARCHIVED";
        type?: "s3";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          description: string | null;
          status: "ACTIVE" | "ARCHIVED";
          config: Partial<Record<string, any>>;
          type: "s3";
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          embeddingProfileId: string;
          createdAt: string;
          updatedAt: string;
          versions: {
            /**
             * @format uuid
             * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
             */
            id: string;
            latest: boolean;
            /**
             * @min 0
             * @max 9007199254740991
             */
            version: number;
            changeLog: string;
            releasedAt: string | null;
            /**
             * @format uuid
             * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
             */
            knowledgeSourceId: string;
          }[];
        }[],
        {
          error: string;
        }
      >({
        path: `/api/knowledge-sources/with-versions`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description List source config schemas
     *
     * @tags Knowledge Sources
     * @name KnowledgeSourcesSchemaList
     * @request GET:/api/knowledge-sources/schema
     */
    knowledgeSourcesSchemaList: (
      query?: {
        targetId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          scope: string;
          targetId: string;
          schema: Partial<Record<string, any>>;
          encryptedFields: string[];
        }[],
        {
          error: string;
        }
      >({
        path: `/api/knowledge-sources/schema`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a knowledge source by ID
     *
     * @tags Knowledge Sources
     * @name KnowledgeSourcesDetail
     * @request GET:/api/knowledge-sources/{id}
     */
    knowledgeSourcesDetail: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          description: string | null;
          status: "ACTIVE" | "ARCHIVED";
          config: Partial<Record<string, any>>;
          type: "s3";
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          embeddingProfileId: string;
          createdAt: string;
          updatedAt: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/knowledge-sources/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Update a knowledge source
     *
     * @tags Knowledge Sources
     * @name KnowledgeSourcesPartialUpdate
     * @request PATCH:/api/knowledge-sources/{id}
     */
    knowledgeSourcesPartialUpdate: (
      id: string,
      data: {
        /**
         * @minLength 1
         * @maxLength 255
         */
        name?: string;
        description?: string | null;
        status?: "ACTIVE" | "ARCHIVED";
        config?: Partial<Record<string, any>>;
        type?: "s3";
        sync?: {
          mode: "pull" | "push";
          cronExpression?: string | null;
          webhookEnabled?: boolean;
          isActive?: boolean;
        };
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          description: string | null;
          status: "ACTIVE" | "ARCHIVED";
          config: Partial<Record<string, any>>;
          type: "s3";
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          embeddingProfileId: string;
          createdAt: string;
          updatedAt: string;
        },
        | {
            error: string;
            details: {
              instancePath: string;
              schemaPath: string;
              message?: string;
              params?: Partial<Record<string, any>>;
            }[];
          }
        | {
            error: string;
          }
      >({
        path: `/api/knowledge-sources/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a knowledge source
     *
     * @tags Knowledge Sources
     * @name KnowledgeSourcesDelete
     * @request DELETE:/api/knowledge-sources/{id}
     */
    knowledgeSourcesDelete: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          description: string | null;
          status: "ACTIVE" | "ARCHIVED";
          config: Partial<Record<string, any>>;
          type: "s3";
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          embeddingProfileId: string;
          createdAt: string;
          updatedAt: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/knowledge-sources/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * @description Get a knowledge source by ID with versions
     *
     * @tags Knowledge Sources
     * @name KnowledgeSourcesWithVersionsList2
     * @request GET:/api/knowledge-sources/{id}/with-versions
     * @originalName knowledgeSourcesWithVersionsList
     * @duplicate
     */
    knowledgeSourcesWithVersionsList2: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          description: string | null;
          status: "ACTIVE" | "ARCHIVED";
          config: Partial<Record<string, any>>;
          type: "s3";
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          embeddingProfileId: string;
          createdAt: string;
          updatedAt: string;
          versions: {
            /**
             * @format uuid
             * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
             */
            id: string;
            latest: boolean;
            /**
             * @min 0
             * @max 9007199254740991
             */
            version: number;
            changeLog: string;
            releasedAt: string | null;
            /**
             * @format uuid
             * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
             */
            knowledgeSourceId: string;
          }[];
        },
        {
          error: string;
        }
      >({
        path: `/api/knowledge-sources/${id}/with-versions`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Release a new knowledge source version
     *
     * @tags Knowledge Sources
     * @name KnowledgeSourcesReleaseVersionCreate
     * @request POST:/api/knowledge-sources/{id}/release-version
     */
    knowledgeSourcesReleaseVersionCreate: (
      id: string,
      data: {
        changeLog: string;
        releasedAt?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          latest: boolean;
          /**
           * @min 0
           * @max 9007199254740991
           */
          version: number;
          changeLog: string;
          releasedAt: string | null;
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          knowledgeSourceId: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/knowledge-sources/${id}/release-version`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get sync config for a knowledge source
     *
     * @tags Knowledge Sources
     * @name KnowledgeSourcesSyncList
     * @request GET:/api/knowledge-sources/{id}/sync
     */
    knowledgeSourcesSyncList: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          mode: "pull" | "push";
          cronExpression: string | null;
          webhookEnabled: boolean;
          isActive: boolean;
          lastRunAt: string | null;
          nextRunAt: string | null;
          createdAt: string;
          updatedAt: string;
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          knowledgeSourceId: string;
        } | null,
        {
          error: string;
        }
      >({
        path: `/api/knowledge-sources/${id}/sync`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Create or update sync config for a knowledge source
     *
     * @tags Knowledge Sources
     * @name KnowledgeSourcesSyncPartialUpdate
     * @request PATCH:/api/knowledge-sources/{id}/sync
     */
    knowledgeSourcesSyncPartialUpdate: (
      id: string,
      data: {
        mode?: "pull" | "push";
        cronExpression?: string | null;
        webhookEnabled?: boolean;
        isActive?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          mode: "pull" | "push";
          cronExpression: string | null;
          webhookEnabled: boolean;
          isActive: boolean;
          lastRunAt: string | null;
          nextRunAt: string | null;
          createdAt: string;
          updatedAt: string;
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          knowledgeSourceId: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/knowledge-sources/${id}/sync`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description List all llm calls
     *
     * @tags LLM Calls
     * @name LlmCallsList
     * @request GET:/api/llm-calls/
     */
    llmCallsList: (
      query?: {
        skip?: number;
        take?: number;
        order?: string;
        /**
         * @format uuid
         * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
         */
        llmId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          cost: number | null;
          promptTokens: number | null;
          completionTokens: number | null;
          totalTokens: number | null;
          /**
           * @min -9007199254740991
           * @max 9007199254740991
           */
          duration: number;
          createdAt: string;
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          llmId: string;
        }[],
        {
          error: string;
        }
      >({
        path: `/api/llm-calls/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Create an llm call
     *
     * @tags LLM Calls
     * @name LlmCallsCreate
     * @request POST:/api/llm-calls/
     */
    llmCallsCreate: (
      data: {
        /**
         * @min -9007199254740991
         * @max 9007199254740991
         */
        duration: number;
        /**
         * @format uuid
         * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
         */
        llmId: string;
        cost?: number | null;
        promptTokens?: number | null;
        completionTokens?: number | null;
        totalTokens?: number | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          cost: number | null;
          promptTokens: number | null;
          completionTokens: number | null;
          totalTokens: number | null;
          /**
           * @min -9007199254740991
           * @max 9007199254740991
           */
          duration: number;
          createdAt: string;
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          llmId: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/llm-calls/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get an llm call by ID
     *
     * @tags LLM Calls
     * @name LlmCallsDetail
     * @request GET:/api/llm-calls/{id}
     */
    llmCallsDetail: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          cost: number | null;
          promptTokens: number | null;
          completionTokens: number | null;
          totalTokens: number | null;
          /**
           * @min -9007199254740991
           * @max 9007199254740991
           */
          duration: number;
          createdAt: string;
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          llmId: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/llm-calls/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Update an llm call
     *
     * @tags LLM Calls
     * @name LlmCallsPartialUpdate
     * @request PATCH:/api/llm-calls/{id}
     */
    llmCallsPartialUpdate: (
      id: string,
      data: {
        cost?: number | null;
        promptTokens?: number | null;
        completionTokens?: number | null;
        totalTokens?: number | null;
        /**
         * @min -9007199254740991
         * @max 9007199254740991
         */
        duration?: number;
        /**
         * @format uuid
         * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
         */
        llmId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          cost: number | null;
          promptTokens: number | null;
          completionTokens: number | null;
          totalTokens: number | null;
          /**
           * @min -9007199254740991
           * @max 9007199254740991
           */
          duration: number;
          createdAt: string;
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          llmId: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/llm-calls/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete an llm call
     *
     * @tags LLM Calls
     * @name LlmCallsDelete
     * @request DELETE:/api/llm-calls/{id}
     */
    llmCallsDelete: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          cost: number | null;
          promptTokens: number | null;
          completionTokens: number | null;
          totalTokens: number | null;
          /**
           * @min -9007199254740991
           * @max 9007199254740991
           */
          duration: number;
          createdAt: string;
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          llmId: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/llm-calls/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * @description List llm config schemas
     *
     * @tags LLMs
     * @name LlmsSchemaList
     * @request GET:/api/llms/schema
     */
    llmsSchemaList: (
      query?: {
        targetId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          scope: string;
          targetId: string;
          schema: Partial<Record<string, any>>;
          encryptedFields: string[];
        }[],
        {
          error: string;
        }
      >({
        path: `/api/llms/schema`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description List all llms
     *
     * @tags LLMs
     * @name LlmsList
     * @request GET:/api/llms/
     */
    llmsList: (
      query?: {
        skip?: number;
        take?: number;
        order?: string;
        provider?: string;
        type?:
          | "TEXT_GENERATION"
          | "EMBEDDING"
          | "IMAGE_GENERATION"
          | "AUDIO_TRANSCRIPTION"
          | "VIDEO_GENERATION";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          name: string | null;
          /**
           * @minLength 1
           * @maxLength 255
           */
          provider: string;
          config: any;
          type:
            | "TEXT_GENERATION"
            | "EMBEDDING"
            | "IMAGE_GENERATION"
            | "AUDIO_TRANSCRIPTION"
            | "VIDEO_GENERATION";
          maxLimits: any;
          currentLimits: any;
          createdAt: string;
          updatedAt: string;
        }[],
        {
          error: string;
        }
      >({
        path: `/api/llms/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Create an llm
     *
     * @tags LLMs
     * @name LlmsCreate
     * @request POST:/api/llms/
     */
    llmsCreate: (
      data: {
        /**
         * @minLength 1
         * @maxLength 255
         */
        provider: string;
        config: any;
        maxLimits: any;
        type:
          | "TEXT_GENERATION"
          | "EMBEDDING"
          | "IMAGE_GENERATION"
          | "AUDIO_TRANSCRIPTION"
          | "VIDEO_GENERATION";
        name?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          name: string | null;
          /**
           * @minLength 1
           * @maxLength 255
           */
          provider: string;
          config: any;
          type:
            | "TEXT_GENERATION"
            | "EMBEDDING"
            | "IMAGE_GENERATION"
            | "AUDIO_TRANSCRIPTION"
            | "VIDEO_GENERATION";
          maxLimits: any;
          currentLimits: any;
          createdAt: string;
          updatedAt: string;
        },
        | {
            error: string;
            details: {
              instancePath: string;
              schemaPath: string;
              message?: string;
              params?: Partial<Record<string, any>>;
            }[];
          }
        | {
            error: string;
          }
      >({
        path: `/api/llms/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get an llm by ID
     *
     * @tags LLMs
     * @name LlmsDetail
     * @request GET:/api/llms/{id}
     */
    llmsDetail: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          name: string | null;
          /**
           * @minLength 1
           * @maxLength 255
           */
          provider: string;
          config: any;
          type:
            | "TEXT_GENERATION"
            | "EMBEDDING"
            | "IMAGE_GENERATION"
            | "AUDIO_TRANSCRIPTION"
            | "VIDEO_GENERATION";
          maxLimits: any;
          currentLimits: any;
          createdAt: string;
          updatedAt: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/llms/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Update an llm
     *
     * @tags LLMs
     * @name LlmsPartialUpdate
     * @request PATCH:/api/llms/{id}
     */
    llmsPartialUpdate: (
      id: string,
      data: {
        name?: string | null;
        /**
         * @minLength 1
         * @maxLength 255
         */
        provider?: string;
        config?: any;
        maxLimits?: any;
        currentLimits?: any;
        type?:
          | "TEXT_GENERATION"
          | "EMBEDDING"
          | "IMAGE_GENERATION"
          | "AUDIO_TRANSCRIPTION"
          | "VIDEO_GENERATION";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          name: string | null;
          /**
           * @minLength 1
           * @maxLength 255
           */
          provider: string;
          config: any;
          type:
            | "TEXT_GENERATION"
            | "EMBEDDING"
            | "IMAGE_GENERATION"
            | "AUDIO_TRANSCRIPTION"
            | "VIDEO_GENERATION";
          maxLimits: any;
          currentLimits: any;
          createdAt: string;
          updatedAt: string;
        },
        | {
            error: string;
            details: {
              instancePath: string;
              schemaPath: string;
              message?: string;
              params?: Partial<Record<string, any>>;
            }[];
          }
        | {
            error: string;
          }
      >({
        path: `/api/llms/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete an llm
     *
     * @tags LLMs
     * @name LlmsDelete
     * @request DELETE:/api/llms/{id}
     */
    llmsDelete: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          name: string | null;
          /**
           * @minLength 1
           * @maxLength 255
           */
          provider: string;
          config: any;
          type:
            | "TEXT_GENERATION"
            | "EMBEDDING"
            | "IMAGE_GENERATION"
            | "AUDIO_TRANSCRIPTION"
            | "VIDEO_GENERATION";
          maxLimits: any;
          currentLimits: any;
          createdAt: string;
          updatedAt: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/llms/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * @description List reranker config schemas
     *
     * @tags Rerankers
     * @name RerankersSchemaList
     * @request GET:/api/rerankers/schema
     */
    rerankersSchemaList: (
      query?: {
        targetId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          scope: string;
          targetId: string;
          schema: Partial<Record<string, any>>;
          encryptedFields: string[];
        }[],
        {
          error: string;
        }
      >({
        path: `/api/rerankers/schema`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description List all rerankers
     *
     * @tags Rerankers
     * @name RerankersList
     * @request GET:/api/rerankers/
     */
    rerankersList: (
      query?: {
        skip?: number;
        take?: number;
        order?: string;
        name?: string;
        type?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          type: string;
          config: Partial<Record<string, any>>;
          createdAt: string;
          updatedAt: string;
        }[],
        {
          error: string;
        }
      >({
        path: `/api/rerankers/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a reranker
     *
     * @tags Rerankers
     * @name RerankersCreate
     * @request POST:/api/rerankers/
     */
    rerankersCreate: (
      data: {
        /**
         * @minLength 1
         * @maxLength 255
         */
        name: string;
        /**
         * @minLength 1
         * @maxLength 255
         */
        type: string;
        config: Partial<Record<string, any>>;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          type: string;
          config: Partial<Record<string, any>>;
          createdAt: string;
          updatedAt: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/rerankers/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a reranker by ID
     *
     * @tags Rerankers
     * @name RerankersDetail
     * @request GET:/api/rerankers/{id}
     */
    rerankersDetail: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          type: string;
          config: Partial<Record<string, any>>;
          createdAt: string;
          updatedAt: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/rerankers/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Update a reranker
     *
     * @tags Rerankers
     * @name RerankersPartialUpdate
     * @request PATCH:/api/rerankers/{id}
     */
    rerankersPartialUpdate: (
      id: string,
      data: {
        /**
         * @minLength 1
         * @maxLength 255
         */
        name?: string;
        /**
         * @minLength 1
         * @maxLength 255
         */
        type?: string;
        config?: Partial<Record<string, any>>;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          type: string;
          config: Partial<Record<string, any>>;
          createdAt: string;
          updatedAt: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/rerankers/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a reranker
     *
     * @tags Rerankers
     * @name RerankersDelete
     * @request DELETE:/api/rerankers/{id}
     */
    rerankersDelete: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * @format uuid
           * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
           */
          id: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          name: string;
          /**
           * @minLength 1
           * @maxLength 255
           */
          type: string;
          config: Partial<Record<string, any>>;
          createdAt: string;
          updatedAt: string;
        },
        {
          error: string;
        }
      >({
        path: `/api/rerankers/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),
  };
}
