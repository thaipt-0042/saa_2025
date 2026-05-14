# Route List

**Project**: {PROJECT_NAME}
**Generated**: {DATE}

## Backend Routes

### File: {ROUTE_FILE}

| Method | Path | Handler | Middleware |
|--------|------|---------|------------|
| GET | /api/resource | ResourceController@index | auth |
| POST | /api/resource | ResourceController@store | auth |
| GET | /api/resource/:id | ResourceController@show | auth |
| PUT | /api/resource/:id | ResourceController@update | auth |
| DELETE | /api/resource/:id | ResourceController@destroy | auth |

## Frontend Routes/Pages

### File: {PAGE_FILE}

| Path | Component | Route Name |
|------|-----------|------------|
| / | HomePage | home |
| /resource | ResourceListPage | resource-list |
| /resource/:id | ResourceDetailPage | resource-detail |

## Summary

| Category | Count |
|----------|-------|
| Backend Routes | {N} |
| Frontend Pages | {N} |
| Total | {N} |
