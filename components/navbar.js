export default props => (
  <nav className="navbar" role="navigation" aria-label="main navigation">
    <div className="navbar-brand">
    </div>
    <div className="navbar-menu is-active">
      <div className="navbar-end">
        <div className="navbar-item">
          <div className="tags has-addons">
            <span className="tag is-medium">username</span>
            <span className="tag is-info is-medium">
              { props.username }
            </span>
          </div>
        </div>
        <div className="navbar-item">
          <div className="tags has-addons">
            <span className="tag is-medium">block</span>
            <span className="tag is-success is-medium">
              { props.block }
            </span>
          </div>
        </div>
      </div>
    </div>
  </nav>
)
