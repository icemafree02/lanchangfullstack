import React from "react";
import styled from "styled-components";

const NavLinksContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  background-color: #fff;
  overflow:none;
`;

const LinksWrapper = styled.ul`
  margin: 0;
  padding: 0;
  display: flex;
  width: 100%;
  max-width: 1200px; /* optional, to limit the spread */
  justify-content: space-around; /* spread items evenly */
  align-items: center;
  list-style: none;
  white-space: nowrap; /* keep links on one line */
`;

const LinkItem = styled.li`
  padding: 0 1em;
  font-weight: 500;
  font-size: 16px;
  display: flex;
  align-items: center;
  height: 60px;
  border-top: 2px solid transparent;
  transition: all 220ms ease-in-out;

  &:hover {
    border-top: 2px solid #2ecc71;
  }
`;

const Link = styled.a`
  text-decoration: none;
  color: #222;
`;

export function NavLinks() {
  return (
    <NavLinksContainer>
      <LinksWrapper>
        <LinkItem>
          <Link href="./firstpage">หน้าหลัก</Link>
        </LinkItem>
        <LinkItem>
          <Link href="/history">ประวัติออเดอร์</Link>
        </LinkItem>
        <LinkItem>
          <Link href="/checkbin">ชำระเงิน</Link>
        </LinkItem>
        <LinkItem>
          <Link href="/order">ดูรายการอาหารที่สั่ง</Link>
        </LinkItem>
        <LinkItem>
          <Link href="./menupage">รายงานอาหาร</Link>
        </LinkItem>
        <LinkItem>
          <Link href="./dashboard">รายงาน</Link>
        </LinkItem>
        <LinkItem>
          <Link href="./ordercustomer">สั่งอาหารให้ลูกค้า</Link>
        </LinkItem>
        <LinkItem>
          <Link href="./table">โต๊ะ</Link>
        </LinkItem>
      </LinksWrapper>
    </NavLinksContainer>
  );
}
