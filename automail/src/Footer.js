import React from "react";
import styled from "styled-components";

const FooterContainer = styled.footer`
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #f1f1f1;
  text-align: center;
  padding: 10px 0;
  color: #a9a9a9;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <p>
        Created by <strong>Marceli Zaborowski</strong>😎
      </p>
    </FooterContainer>
  );
};

export default Footer;
