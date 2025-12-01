import React from 'react';
import Header from './Header';
import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background-main font-sans">
            <Header />

            <div className="pt-[60px] flex justify-center">
                <SidebarLeft />

                <main className="flex-1 max-w-[700px] w-full mx-4 md:ml-[250px] lg:mr-[320px] py-6">
                    {children}
                </main>

                <SidebarRight />
            </div>
        </div>
    );
};

export default Layout;
