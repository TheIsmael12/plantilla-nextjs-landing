/**
 * Map of semantic HTTP status code names to their numeric values.
 * Used to reference status codes without magic numbers across the codebase.
 *
 * @interface HttpStatusCode
 * @property {number} OK                   - 200 The request succeeded.
 * @property {number} CREATED              - 201 A new resource was created successfully.
 * @property {number} ACCEPTED             - 202 The request has been accepted for processing.
 * @property {number} NO_CONTENT           - 204 The request succeeded but returns no body.
 * @property {number} BAD_REQUEST          - 400 The server cannot process the request due to a client error.
 * @property {number} UNAUTHORIZED         - 401 Authentication is required and has failed or not been provided.
 * @property {number} FORBIDDEN            - 403 The server understood the request but refuses to authorise it.
 * @property {number} NOT_FOUND            - 404 The requested resource could not be found.
 * @property {number} NOT_ACCEPTABLE       - 406 The requested resource cannot generate content matching Accept headers.
 * @property {number} GONE                 - 410 The resource existed and is permanently gone (a closed job posting).
 * @property {number} PRECONDITION_FAILED  - 412 One or more conditions in the request headers evaluated to false.
 * @property {number} CONTENT_TOO_LARGE    - 413 The request body exceeds the server-defined limit.
 * @property {number} TOO_MANY_REQUEST     - 429 The client has sent too many requests in a given time window.
 * @property {number} IM_TEAPOT            - 418 I'm a teapot (RFC 2324 — used as a custom sentinel in this project).
 * @property {number} INTERNAL_SERVER_ERROR - 500 The server encountered an unexpected condition.
 * @property {number} CONFLICT             - 409 The request conflicts with the current state of the resource.
 * @property {number} SERVER_ERROR         - 502 Bad Gateway — the upstream server returned an invalid response.
 * @property {number} SERVICE_UNAVAILABLE  - 503 The server is temporarily unavailable.
 */
interface HttpStatusCode {
  OK: number;
  CREATED: number;
  ACCEPTED: number;
  NO_CONTENT: number;
  BAD_REQUEST: number;
  UNAUTHORIZED: number;
  FORBIDDEN: number;
  NOT_FOUND: number;
  NOT_ACCEPTABLE: number;
  GONE: number;
  PRECONDITION_FAILED: number;
  CONTENT_TOO_LARGE: number;
  TOO_MANY_REQUEST: number;
  IM_TEAPOT: number;
  INTERNAL_SERVER_ERROR: number;
  CONFLICT: number;
  SERVER_ERROR: number;
  SERVICE_UNAVAILABLE: number;
}
