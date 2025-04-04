'use client'

import { Link, useLocation } from 'react-router-dom';
import { UserProfile } from './UserProfile';
import Auth from './Auth';
import 'nes.css/css/nes.min.css';
import './Navbar.css';
import sdk from "@farcaster/frame-sdk";
import { useEffect, useState } from 'react';

export type SafeAreaInsets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type FrameNotificationDetails = {
  url: string;
  token: string;
};

export type AccountLocation = {
  placeId: string;
  description: string;
};

export type UserContext = {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  bio?: string;
  location?: AccountLocation;
};

export type ClientContext = {
  clientFid: number;
  added: boolean;
  safeAreaInsets?: SafeAreaInsets;
  notificationDetails?: FrameNotificationDetails;
};

export type CastEmbedLocationContext = {
  type: "cast_embed";
  embed: string;
  cast: {
    fid: number;
    hash: string;
  };
};

export type NotificationLocationContext = {
  type: "notification";
  notification: {
    notificationId: string;
    title: string;
    body: string;
  };
};

export type LauncherLocationContext = {
  type: "launcher";
};

export type ChannelLocationContext = {
  type: "channel";
  channel: {
    /**
     * Channel key identifier
     */
    key: string;

    /**
     * Channel name
     */
    name: string;

    /**
     * Channel profile image URL
     */
    imageUrl?: string;
  };
};

export type LocationContext =
  | CastEmbedLocationContext
  | NotificationLocationContext
  | LauncherLocationContext
  | ChannelLocationContext;

export type FrameContext = {
  user?: UserContext;
  location?: LocationContext;
  client?: ClientContext;
};

export type ReadyOptions = Partial<{
  /**
   * Disable native gestures. Use this option if your frame uses gestures
   * that conflict with native gestures.
   */
  disableNativeGestures: boolean;
}>;

export type OpenUrlOptions = {
  url: string;
  close?: boolean;
};

export type CloseOptions = {
  toast?: {
    message: string;
  };
};

export interface FrameActions {
  ready: (options?: ReadyOptions) => Promise<void>;
  openUrl: (options: OpenUrlOptions) => Promise<void>;
  close: (options?: CloseOptions) => Promise<void>;
}

export interface FrameWallet {
  ethProvider: {
    request: (request: { method: string; params?: any[] }) => Promise<any>;
  };
}

export interface FarcasterFrameSDK {
  context: Promise<FrameContext>;
  actions: FrameActions;
  wallet: FrameWallet;
}

// Removed unused VerifyResult type

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isGameRoute = currentPath === '/' || currentPath === '/play';
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();
  // Removed unused state variables context and isInFrame

  const load = async () => {
    try {
      // Still fetch the context but don't store it since it's not being used
      const sdkcontext = await sdk.context;

      setContext(sdkcontext);
      void sdk.actions.ready();

      void sdk.actions.addFrame

      if (context?.user?.fid && context.client?.added === false) {
        void sdk.actions.addFrame();
      }

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      void load();
    }
  }, [isSDKLoaded]);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          {isGameRoute ? (
            <Link to="/leaderboard" className="nes-text">Leaderboard</Link>
          ) : (
            <Link to="/play" className="nes-btn is-primary">Play</Link>
          )}
        </div>

        <div className="navbar-center">
          {isGameRoute ? (
            <Link to="/airdrop" className="nes-text is-primary">Airdrop</Link>
          ) : (
            currentPath === '/airdrop' ? (
              <Link to="/leaderboard" className="nes-text">Leaderboard</Link>
            ) : (
              <Link to="/airdrop" className="nes-text is-primary">Airdrop</Link>
            )
          )}
        </div>

        <div className="navbar-right">
          <UserProfile />
          <Auth />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;