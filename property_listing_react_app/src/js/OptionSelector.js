import React from 'react'

class OptionSelector extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { label, name, options, filterProperties } = this.props

    return (
      <div className="filterBox">
        <label htmlFor={name}>{label}</label>
        <select onChange={e => filterProperties(e)} id={name} name={name}>
          {options.map(option => {
            return (
              <option key={option.name} value={option.value}>
                {option.name}
              </option>
            )
          })}
        </select>
      </div>
    )
  }
}

export default OptionSelector
