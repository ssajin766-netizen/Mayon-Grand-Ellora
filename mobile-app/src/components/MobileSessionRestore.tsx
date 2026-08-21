import React, {
  useEffect,
} from 'react';

import {
  useWebView,
} from '../context/WebViewContext';

import api from '../services/api';

import {
  getMobileAuthToken,
  clearMobileAuthToken,
} from '../services/mobileAuthToken';


const MobileSessionRestore:
  React.FC = () => {

  const {
    setRestoreTicket,
  } = useWebView();


  useEffect(() => {

    let mounted = true;


    const restore =
      async () => {

        try {

          console.log(
            '========================================'
          );

          console.log(
            'MOBILE SESSION RESTORE START'
          );

          console.log(
            '========================================'
          );


          const token =
            await getMobileAuthToken();


          if (!token) {

            console.log(
              'NO MOBILE AUTH TOKEN'
            );

            return;
          }


          const response =
            await api.post(
              '/api/auth/mobile-webview-restore-ticket',
              {
                token,
              }
            );


          const ticket =
            response.data?.ticket;


          if (
            !response.data?.success ||
            !ticket
          ) {

            console.error(
              'FAILED TO CREATE RESTORE TICKET'
            );

            await clearMobileAuthToken();

            return;
          }


          if (!mounted) {
            return;
          }


          console.log(
            'MOBILE RESTORE TICKET RECEIVED'
          );


          setRestoreTicket(
            ticket
          );

        }

        catch (error) {

          console.error(
            'MOBILE SESSION RESTORE ERROR:',
            error
          );

        }

      };


    restore();


    return () => {

      mounted = false;

    };

  }, [
    setRestoreTicket,
  ]);


  return null;
};


export default MobileSessionRestore;