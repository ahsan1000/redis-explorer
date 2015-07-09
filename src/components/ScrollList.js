import React from 'react'
import autobind from 'autobind-decorator'

@autobind
class ScrollList extends React.Component {

  static propTypes = {
    getItems: React.PropTypes.func.isRequired,
    itemHeight: React.PropTypes.number.isRequired,
    renderRoot: React.PropTypes.func,
    renderItem: React.PropTypes.func,
    renderPlaceholder: React.PropTypes.func,
    offset: React.PropTypes.number
  }

  static defaultProps = {
    offset: 0,
    limit: 60,
    renderRoot: (props, children) => {
      return (
        <ul {...props}>
          {children}
        </ul>
      )
    },
    renderItem: (props, item) => {
      return (
        <li {...props}>
          {item}
        </li>
      )
    },
    renderPlaceholder: (props) => {
      return <li {...props}></li>
    }
  }

  state = {
    offset: this.props.offset
  }

  componentDidMount () {
    React.findDOMNode(this).scrollTop = this.state.offset * this.props.itemHeight
  }

  onScroll (e) {
    let top = e.currentTarget.scrollTop
    let count = Math.floor(top / this.props.itemHeight)
    let newOffset

    if (count !== this.state.offset) {
      newOffset = count
      this.setState({offset: newOffset})
    }
    if (this.props.scrollHandler) {
      this.props.scrollHandler(e, newOffset)
    }
  }

  getDisplayOffset () {
    let offset = this.state.offset - Math.floor(this.props.limit / 3)
    return (offset >= 0) ? offset : 0
  }

  ensureVisible (index) {
    let container = React.findDOMNode(this)
    let itemTop = index * this.props.itemHeight
    let top = container.scrollTop
    let height = container.offsetHeight
    let count = Math.floor(height / this.props.itemHeight)

    if (itemTop < top) {
      container.scrollTop = (index - count + 2) * this.props.itemHeight
    }
    if ((itemTop + this.props.itemHeight) > (top + height - this.props.itemHeight)) {
      container.scrollTop = index * this.props.itemHeight
    }
  }

  renderItems () {
    let items = this.props.getItems()
    let offset = this.getDisplayOffset()
    let slice = items.slice(offset, offset + this.props.limit)
    let results = []
    let baseStyles = {
          visibility: 'hidden !important',
          lineHeight: '0 !important',
          padding: '0 !important',
          margin: '0 !important',
          border: 'none !important',
          fontSize: '0 !important'
        }

    // Add top placeholder.
    results.push(this.props.renderPlaceholder({
      key: 'scroll-list-placeholder-top',
      style: Object.assign({
        height: (offset * this.props.itemHeight) + 'px'
      }, baseStyles)
    }))

    // Add currently visible items.
    results = results.concat(slice.map((item, i) => {
      return this.props.renderItem({
        key: item.key || (offset + '_' + i)
      }, item)
    }))

    // Add bottom placeholder.
    results.push(this.props.renderPlaceholder({
      key: 'scroll-list-placeholder-bottom',
      style: Object.assign({
        height: ((items.length - offset - slice.length) * this.props.itemHeight) + 'px'
      }, baseStyles)
    }))

    return results
  }

  render () {
    return this.props.renderRoot({
      style: {
        overflow: 'auto'
      },
      onScroll: this.onScroll
    }, this.renderItems())
  }
}

export default ScrollList
