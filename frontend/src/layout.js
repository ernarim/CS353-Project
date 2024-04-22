import React from 'react'

import { Layout, Menu, theme } from 'antd';
import Topbar from "./topbar";
import {Outlet} from "react-router-dom";
const { Header, Content, Footer, Sider } = Layout;


export const AppLayout = () =>{
    return(
        <>
            <Layout className="layout-root">
                <Layout style={{ minHeight: '100vh' }}>
                    <Header className="akd-sidebar" breakpoint="lg" collapsedWidth="50">
                       <Topbar/>
                    </Header>
                    <Layout>
                        <Content >
                            <Outlet />
                        </Content>

                    </Layout>
                </Layout>
            </Layout>
        </>
    );

};