import "./PageNavigator.css"

type PageNavProps = {
    pages: number
    currentPage: number
    onPageChange: (page: number) => void
}

function PageNavigator(props: PageNavProps) {
  const startPage = Math.max(1, props.currentPage - 2)
  const endPage = Math.min(props.pages, props.currentPage + 2)
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  return (
    <div className="page-navigator">
      {pageNumbers.map((page) => (
        <button
          key={page}
          className={`page-button ${page === props.currentPage ? 'active' : ''}`}
          onClick={() => props.onPageChange(page)}
        >
          {page}
        </button>
      ))}
    </div>
  )
}

export default PageNavigator