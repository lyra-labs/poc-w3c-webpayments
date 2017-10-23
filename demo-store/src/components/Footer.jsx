/* eslint-disable react/no-array-index-key */

import React from 'react';

const generateLinkList = config => (
  <div className="linkList">
    <h4>{config.title}</h4>
    {config.links && config.links.map((link, i) => <span key={i}>{link}</span>)}
  </div>
);

export default () => (
  <footer>
    <div className="row">
      {generateLinkList({
        title: 'Melody',
        links: ['About', 'Terms and Conditions', 'Privacy Policy', 'Contact us'],
      })}
      {generateLinkList({
        title: 'Customer Care',
        links: ['Contact Us', 'FAQs', 'Delivery & Shipping', 'Returns Policy'],
      })}
      {generateLinkList({
        title: '© Melody 2017',
      })}
    </div>
  </footer>
);
