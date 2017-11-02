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
                    <span className="icon" style={{marginLeft: '-7px'}}>
                      <i className="fa fa-trophy" style={{color: colors[i]}}></i>
                    </span>
                   : i + 1) : '#' + (t.length - i) }
                </td>
                <td>
                  { this.props.usernames.get(x.hash) != '' ?
                    <div><span className="username">{ this.props.usernames.get(x.hash) }</span>
                    <span className="hash invisiHash">{ x.hash }</span></div>
                    :
                    <span className="hash">{ x.hash + "hi" }</span>
                  }
                </td>
                { x.score && <td>{ x.score }</td> }
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }
}
