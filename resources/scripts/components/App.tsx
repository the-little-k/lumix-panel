import React, { lazy, useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import { Route, Router, Switch } from 'react-router-dom';
import { StoreProvider } from 'easy-peasy';
import { store } from '@/state';
import { SiteSettings } from '@/state/settings';
import ProgressBar from '@/components/elements/ProgressBar';
import { NotFound } from '@/components/elements/ScreenBlock';
import tw from 'twin.macro';
import GlobalStylesheet from '@/assets/css/GlobalStylesheet';
import { history } from '@/components/history';
import { setupInterceptors } from '@/api/interceptors';
import AuthenticatedRoute from '@/components/elements/AuthenticatedRoute';
import { ServerContext } from '@/state/server';
import '@/assets/tailwind.css';
import Spinner from '@/components/elements/Spinner';
import { applyLumixTheme, getStoredTheme } from '@/components/lumix/applyLumixTheme';

const DashboardRouter = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/routers/DashboardRouter'));
const ServerRouter = lazy(() => import(/* webpackChunkName: "server" */ '@/routers/ServerRouter'));
const AuthenticationRouter = lazy(() => import(/* webpackChunkName: "auth" */ '@/routers/AuthenticationRouter'));

/** Shape of the user object injected from Blade (`window.LumixUser`). */
interface InjectedPanelUser {
    uuid: string;
    username: string;
    email: string;
    /* eslint-disable camelcase */
    root_admin: boolean;
    use_totp: boolean;
    language: string;
    updated_at: string;
    created_at: string;
    /* eslint-enable camelcase */
}

interface LumixWindow extends Window {
    SiteConfiguration?: SiteSettings;
    LumixUser?: InjectedPanelUser;
    /** @deprecated Prefer LumixUser */
    PterodactylUser?: InjectedPanelUser;
}

setupInterceptors(history);

const App = () => {
    useEffect(() => {
        applyLumixTheme(getStoredTheme());
    }, []);

    const { LumixUser, PterodactylUser, SiteConfiguration } = window as LumixWindow;
    const injectedUser = LumixUser ?? PterodactylUser;

    if (injectedUser && !store.getState().user.data) {
        store.getActions().user.setUserData({
            uuid: injectedUser.uuid,
            username: injectedUser.username,
            email: injectedUser.email,
            language: injectedUser.language,
            rootAdmin: injectedUser.root_admin,
            useTotp: injectedUser.use_totp,
            createdAt: new Date(injectedUser.created_at),
            updatedAt: new Date(injectedUser.updated_at),
        });
    }

    if (!store.getState().settings.data) {
        store.getActions().settings.setSettings(SiteConfiguration!);
    }

    return (
        <>
            <GlobalStylesheet />
            <StoreProvider store={store}>
                <ProgressBar />
                <div css={tw`min-h-screen w-full`}>
                    <Router history={history}>
                        <Switch>
                            <Route path={'/auth'}>
                                <Spinner.Suspense>
                                    <AuthenticationRouter />
                                </Spinner.Suspense>
                            </Route>
                            <AuthenticatedRoute path={'/server/:id'}>
                                <Spinner.Suspense>
                                    <ServerContext.Provider>
                                        <ServerRouter />
                                    </ServerContext.Provider>
                                </Spinner.Suspense>
                            </AuthenticatedRoute>
                            <AuthenticatedRoute path={'/'}>
                                <Spinner.Suspense>
                                    <DashboardRouter />
                                </Spinner.Suspense>
                            </AuthenticatedRoute>
                            <Route path={'*'}>
                                <NotFound />
                            </Route>
                        </Switch>
                    </Router>
                </div>
            </StoreProvider>
        </>
    );
};

export default hot(App);
