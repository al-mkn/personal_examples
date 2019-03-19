import React, { Component } from 'react'
import PropTypes from 'prop-types'
import OptionSelector from './OptionSelector'

class Filter extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { toggleFilter, filterProperties, clearFilter } = this.props

    return (
      <form ref="filterMap" className="filter">
        <OptionSelector
          label="Bedrooms"
          name="bedrooms"
          options={[
            { name: 'Any', value: 'any' },
            { name: '1', value: 1 },
            { name: '2', value: 2 },
            { name: '3', value: 3 },
          ]}
          filterProperties={filterProperties}
        />
        <OptionSelector
          label="Bathrooms"
          name="bathrooms"
          options={[
            { name: 'Any', value: 'any' },
            { name: '1', value: 1 },
            { name: '2', value: 2 },
          ]}
          filterProperties={filterProperties}
        />
        <OptionSelector
          label="Car Spaces"
          name="carSpaces"
          options={[
            { name: 'Any', value: 'any' },
            { name: '0', value: 0 },
            { name: '1', value: 1 },
            { name: '2', value: 2 },
          ]}
          filterProperties={filterProperties}
        />
        <OptionSelector
          label="Min Price"
          name="priceFrom"
          options={[
            { name: 'Any', value: 'any' },
            { name: '500000', value: 500000 },
            { name: '600000', value: 600000 },
            { name: '700000', value: 700000 },
            { name: '800000', value: 800000 },
            { name: '900000', value: 900000 },
          ]}
          filterProperties={filterProperties}
        />
        <OptionSelector
          label="Max Price"
          name="priceTo"
          options={[
            { name: 'Any', value: 'any' },
            { name: '600000', value: 600000 },
            { name: '700000', value: 700000 },
            { name: '800000', value: 800000 },
            { name: '900000', value: 900000 },
            { name: '1000000', value: 1000000 },
          ]}
          filterProperties={filterProperties}
        />
        <OptionSelector
          label="Order by"
          name="sortListings"
          options={[
            { name: 'Default', value: 'default' },
            { name: 'Price: - Low to High', value: 'ascending' },
            { name: 'Price: - High to Low', value: 'descending' },
          ]}
          filterProperties={filterProperties}
        />
        <div className="filterBox">
          <label>&nbsp;</label>
          <button
            onClick={e => clearFilter(e, this.refs.filterMap)}
            className="btn-clear"
          >
            Clear
          </button>
        </div>
        <button onClick={e => toggleFilter(e)} className="btn-filter">
          <strong>X</strong>
          <span>Close</span>
        </button>
      </form>
    )
  }
}

export default Filter

Filter.PropTypes = {
  toggleFilter: PropTypes.func.isRequired,
  filterProperties: PropTypes.func.isRequired,
}
