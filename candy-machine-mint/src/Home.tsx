import { useEffect, useState } from "react";
import styled from "styled-components";
import Countdown from "react-countdown";
import { Button, CircularProgress, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

import * as anchor from "@project-serum/anchor";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";

import {
  CandyMachine,
  awaitTransactionSignatureConfirmation,
  getCandyMachineState,
  mintOneToken,
  shortenAddress,
} from "./candy-machine";

const ConnectButtonContainer = styled.div`
    

    margin: 0 auto 0 auto;
    padding: 100px;
    display: grid;
    grid-template-rows: 1;
    grid-template-columns: 1;
    justify-content: center;
    text-align: center;

`;

const ConnectButton = styled(WalletDialogButton)`
    width: 400px;
`;

const CounterText = styled.span`

`; // add your styles here

const MintContainer = styled.div`
    width: 400px;
    margin: 0 auto 0 auto;
    display: grid;
    justify-content: center;
    text-align: center;
`; // add your styles here

const MintButton = styled(Button)`
    width: 200px;
`; // add your styles here

const WalletContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    margin: 50px auto 0 auto;
    font-family: Raleway;
`;

const WalletBalanceValue = styled.div`
    font-size: 21px;
    text-align: center;
    margin: 0 auto 0 auto;
`;

const WalletAddressValue = styled.div`
    font-size: 21px;
    font-weight: bold;
    margin: 0 auto 0 auto;
`;


const StatsContainer = styled.div`
    
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    row-gap: 10px;
    column-gap: 0px;
    font-family: Cinzel;
`;

const StatLabel = styled.div`
    width: 400px;
    margin: 0 0 0 auto;
    font-size: 32px;
    font-weight: bold;
    text-align: right;
`; // add your styles here

const StatValue = styled.div`
    width: 400px;
    margin: 0 0 0 0;
    font-size: 32px;
    font-family: Raleway;
    margin: 0;
    text-align: center;
`; // add your styles here

export interface HomeProps {
  candyMachineId: anchor.web3.PublicKey;
  config: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  treasury: anchor.web3.PublicKey;
  txTimeout: number;
}

const Home = (props: HomeProps) => {
  const [balance, setBalance] = useState<number>();
  const [isActive, setIsActive] = useState(false); // true when countdown completes
  const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT

  const [itemsAvailable, setItemsAvailable] = useState(0);
  const [itemsRedeemed, setItemsRedeemed] = useState(0);
  const [itemsRemaining, setItemsRemaining] = useState(0);

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const [startDate, setStartDate] = useState(new Date(props.startDate));

  const wallet = useAnchorWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();

  const refreshCandyMachineState = () => {
    (async () => {
      if (!wallet) return;

      const {
        candyMachine,
        goLiveDate,
        itemsAvailable,
        itemsRemaining,
        itemsRedeemed,
      } = await getCandyMachineState(
        wallet as anchor.Wallet,
        props.candyMachineId,
        props.connection
      );

      setItemsAvailable(itemsAvailable);
      setItemsRemaining(itemsRemaining);
      setItemsRedeemed(itemsRedeemed);

      setIsSoldOut(itemsRemaining === 0);
      setStartDate(goLiveDate);
      setCandyMachine(candyMachine);
    })();
  };

  const onMint = async () => {
    try {
      setIsMinting(true);
      if (wallet && candyMachine?.program) {
        const mintTxId = await mintOneToken(
          candyMachine,
          props.config,
          wallet.publicKey,
          props.treasury
        );

        const status = await awaitTransactionSignatureConfirmation(
          mintTxId,
          props.txTimeout,
          props.connection,
          "singleGossip",
          false
        );

        if (!status?.err) {
          setAlertState({
            open: true,
            message: "Success! Welcome to Solana Nation",
            severity: "success",
          });
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Classy.  You don't have enough SOL.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          setIsSoldOut(true);
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
      setIsMinting(false);
      refreshCandyMachineState();
    }
  };

  useEffect(() => {
    (async () => {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, props.connection]);

  useEffect(refreshCandyMachineState, [
    wallet,
    props.candyMachineId,
    props.connection,
  ]);



  return (
    <main>
     
          {wallet && 
          <StatsContainer>

              <StatLabel>Total Numbers in Series</StatLabel>
              <StatValue>{itemsAvailable}</StatValue>

              <StatLabel>Total Claimed</StatLabel>
              <StatValue>{itemsRedeemed}</StatValue>

              <StatLabel>How Many Left</StatLabel>
              <StatValue>{itemsRemaining}</StatValue>

          </StatsContainer>
          
          }

          {wallet &&
          <WalletContainer>
              <WalletAddressValue>{shortenAddress(wallet.publicKey.toBase58() || "")}</WalletAddressValue>
              <WalletBalanceValue>{"~" + balance?.toFixed(3) + " SOL"}</WalletBalanceValue>
              <MintContainer>
                    <MintButton 
                        disabled={isSoldOut || isMinting || !isActive}
                        onClick={onMint}
                        variant="contained">
                        {isSoldOut ? (
                            "SOLD OUT"
                        ) : isActive ? (
                            isMinting ? (
                                <CircularProgress />
                            ) : (
                                "MINT @ 1 SOL"
                            )
                        ) : (
                            <Countdown
                                date={startDate}
                                onMount={({ completed }) => completed && setIsActive(true)}
                                onComplete={() => setIsActive(true)}
                                renderer={renderCounter}
                            />
                        )}
                    </MintButton>

              </MintContainer>
          </WalletContainer>
          }

          {!wallet &&
              <ConnectButtonContainer>
                <ConnectButton>Connect Wallet</ConnectButton>
              </ConnectButtonContainer>
          }

      

      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </main>
  );
};

interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error" | undefined;
}

const renderCounter = ({ days, hours, minutes, seconds, completed }: any) => {
  return (
    <CounterText>
      {hours + (days || 0) * 24} hours, {minutes} minutes, {seconds} seconds
    </CounterText>
  );
};

export default Home;
