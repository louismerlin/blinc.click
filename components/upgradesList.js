import { Component } from 'react'

export default class UpgradesList extends Component {
  render () {
    const colors = ['#efd737', '#c9c9c9', '#cea061']
    return (
      <div style={{maxHeight: '35vh', overflow: 'auto'}}>
        <table className="table is-narrow is-fullwidth" >
          <tbody>
            { this.props.table.map((x, i, t) =>
              <tr key={i}>
                <td>{ x.score ? (i < 3 ?
                    <span className="icon">
                      <i className="fa fa-trophy" style={{color: colors[i]}}></i>
                    </span>
                   : i + 1) : '#' + (t.length - i) }</td>
                <td>
                  { x.username != '' ?
                    <div><span className="username">{ x.username.substr(0, 41) }</span>
                    <span className="hash invisiHash">{ x.hash }</span></div>
                    :
                    <span className="hash">{ x.hash }</span>
                  }
                </td>
                { x.score && <td>{ x.score }</td> }
              </tr>) }
          </tbody>
        </table>
      </div>
    )
  }
}
