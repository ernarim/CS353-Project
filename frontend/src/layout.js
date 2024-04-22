import React from 'react'
import Sidebar from "../sidebar";

import { Layout, Menu, theme } from 'antd';
import Topbar from "../topbar";
import PowerControlCard from "../components/PowerControlCard";
import PowerSettingsCard from "../components/PowerSettingsCard";
import { DevicesPage } from "../pages/DevicesPage";
import {PowerPage} from "../pages/PowerPage";
import {PowerSettingsPage} from "../pages/PowerSettingsPage";
import {SettingsPage} from "../pages/SettingsPage";
import {Outlet} from "react-router-dom";
const { Header, Content, Footer, Sider } = Layout;


export const AppLayout = () =>{
    return(
        <>
            <Layout className="layout-root">
                <Layout style={{ minHeight: '100vh' }}>
                    <Sider className="akd-sidebar" breakpoint="lg" collapsedWidth="50">
                       <Sidebar/>
                    </Sider>
                    <Layout>
                        <Content style={{ margin: '24px 16px 0' }}>
                            <Outlet />
                        </Content>

                    </Layout>
                </Layout>
            </Layout>
        </>
    );

};