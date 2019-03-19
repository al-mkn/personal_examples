import React from 'react'
import image from '../images/house-location-pin.svg'
import PropTypes from 'prop-types'
import Filter from './Filter'

const Header = ({
  isFilterVisible,
  toggleFilter,
  filterProperties,
  clearFilter,
}) => {
  return (
    <header className={`${isFilterVisible ? 'filter-is-visible' : ''}`}>
      <Filter
        toggleFilter={toggleFilter}
        filterProperties={filterProperties}
        clearFilter={clearFilter}
      />

      <img src={image} />
      <h1>Property Listings</h1>
      <button onClick={e => toggleFilter(e)} className="btn-filter">
        Filter
      </button>
    </header>
  )
}

export default Header

Header.PropTypes = {
  isFilterVisible: PropTypes.bool.isRequired,
  toggleFilter: PropTypes.func.isRequired,
  filterProperties: PropTypes.func.isRequired,
}
