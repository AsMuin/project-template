// 分层约定：
//
//	Handler  绑定内嵌 PageRequest 的 Query，调用 Service，RespondOK
//	Service  业务条件/权限 → repo.ListPage → NewPageResponse（或 Map 转 VO）
//	Repo     同一套 WHERE 做 Count + Offset/Limit，返回 (items, total, error)
//
// Repo 不组装 PageResponse；响应壳只在 Service（或更上层用例）完成。
package page

const (
	defaultPageSize = 10
	defaultPageNum  = 1
	maxPageSize     = 100
)

// PageRequest 分页请求。可嵌入业务查询结构体：
//
//	type Query struct {
//	    page.PageRequest
//	    Name string `form:"name"`
//	}
type PageRequest struct {
	PageSize int `json:"pageSize" form:"pageSize"`
	PageNum  int `json:"pageNum" form:"pageNum"`
}

// normalize 规范化页码与页大小（默认 pageNum=1、pageSize=10，最大 pageSize=100）。
func (p *PageRequest) normalize() {
	if p.PageSize <= 0 {
		p.PageSize = defaultPageSize
	}
	if p.PageSize > maxPageSize {
		p.PageSize = maxPageSize
	}
	if p.PageNum <= 0 {
		p.PageNum = defaultPageNum
	}
}

// Offset 对应 SQL OFFSET（会先 Normalize）。
func (p *PageRequest) Offset() int {
	p.normalize()
	return (p.PageNum - 1) * p.PageSize
}

// Limit 对应 SQL LIMIT（会先 Normalize）。
func (p *PageRequest) Limit() int {
	p.normalize()
	return p.PageSize
}

// PageResponse 标准分页响应，作为接口 data 使用（字段保持 records/total/pageSize/pageNum）。
type PageResponse[T any] struct {
	Records  []T   `json:"records"`
	Total    int64 `json:"total"`
	PageSize int   `json:"pageSize"`
	PageNum  int   `json:"pageNum"`
}

// NewPageResponse 由本页数据与总数组装响应。
// 会 Normalize req；records 为 nil 时改为空切片，避免 JSON null。
func NewPageResponse[T any](records []T, total int64, req PageRequest) *PageResponse[T] {
	req.normalize()
	if records == nil {
		records = []T{}
	}
	return &PageResponse[T]{
		Records:  records,
		Total:    total,
		PageSize: req.PageSize,
		PageNum:  req.PageNum,
	}
}

// MapPage 对本页元素做映射后组装响应（仅映射当前页，禁止先全表再分页）。
func MapPage[A, B any](records []A, total int64, req PageRequest, fn func(A) B) *PageResponse[B] {
	out := make([]B, 0, len(records))
	for _, item := range records {
		out = append(out, fn(item))
	}
	return NewPageResponse(out, total, req)
}

// Pages 总页数（total=0 时为 0）。
func (p *PageResponse[T]) Pages() int64 {
	if p == nil || p.PageSize <= 0 || p.Total <= 0 {
		return 0
	}
	return (p.Total + int64(p.PageSize) - 1) / int64(p.PageSize)
}
