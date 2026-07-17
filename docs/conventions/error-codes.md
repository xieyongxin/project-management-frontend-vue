# Error Codes

错误码由后端 OpenAPI 契约维护，前端不维护另一套容易漂移的错误码真相。

示例：

- `AUTH_SESSION_EXPIRED`
- `AUTH_FORBIDDEN`
- `AUTH_INVALID_CREDENTIALS`
- `AUTH_CSRF_INVALID`
- `PROJECT_NOT_FOUND`

前端 `AppError` 负责标准化错误、用户提示和行为映射，并保留未知错误兜底。
