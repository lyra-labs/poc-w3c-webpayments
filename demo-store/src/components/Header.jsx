import React from 'react';
import PropTypes from 'prop-types';
import IconMusicNote from 'material-ui/svg-icons/av/equalizer';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Cart from './Cart';

const propTypes = {
  muiTheme: PropTypes.object.isRequired,
};

const iconStyle = {
  width: 100,
  height: 60,
};

const Header = props => (
  <header>
    <div id="headerPadding" />
    <div id="title" className="row">
      <div id="logo">
        <IconMusicNote
          style={iconStyle}
          color={props.muiTheme.palette.primary1Color}
          viewBox="0 0 20 20"
        />
        Melody Demo Store
      </div>
      <Cart />
    </div>
    <h2 className="row divided">
      <span>Latest songs</span>
    </h2>
  </header>
);

Header.propTypes = propTypes;

export default muiThemeable()(Header);
