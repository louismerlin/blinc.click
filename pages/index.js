import stylesheet from 'styles/index.scss'
export default () => (
  <main>
  <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
  <h1 className="title">Hello, World</h1>
  <button className="button">hello, button</button>
  </main>
)
