import React from "react";
import _ from "lodash";
import hive from "@hiveio/hive-js";
import { useLocation } from "react-router-dom";
import { useFirestore, useFirestoreDocData } from "reactfire";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Chip from "@material-ui/core/Chip";
import Icon from "@material-ui/core/Icon";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import Link from "@material-ui/core/Link";

import ChooseAccount from "../../components/ChooseAccount";
import BackupAccount from "../../components/BackupAccount";
import ChooseDApp from "../../components/ChooseDApp";

const useStyles = makeStyles((theme) => ({
  card: {
    margin: 10,
  },
  subHeader: {
    fontSize: 14,
  },
  title: {
    flexGrow: 1,
  },
  chip: {
    margin: theme.spacing(0.5, 0, 0.5, 0),
  },
}));

const CreateAccountPage = () => {
  const classes = useStyles();
  const location = useLocation();
  const firestore = useFirestore();
  const publicData = useFirestoreDocData(firestore.doc("public/data"));

  const [accountTickets, setAccountTickets] = React.useState(0);
  const [referrer, setReferrer] = React.useState(null);
  const [referrerAccount, setReferrerAccount] = React.useState(null);
  const [creator, setCreator] = React.useState(null);
  const [redirectUrl, setRedirectUrl] = React.useState(null);
  const [debugMode, setDebugMode] = React.useState(false);

  const [activeStep, setActiveStep] = React.useState(0);
  const [account, setAccount] = React.useState({});
  const steps = getSteps();

  React.useEffect(() => {
    const query = new URLSearchParams(location.search);

    if (!_.isNil(query.get("ref"))) {
      hive.api.getAccounts([query.get("ref")], function (err, result) {
        if (result) {
          if (result.length === 1) {
            setReferrer(query.get("ref"));
            setReferrerAccount(result[0]);
          }
        }
      });
    }
    if (!_.isNil(query.get("creator"))) {
      setCreator(query.get("creator"));
    }
    if (!_.isNil(query.get("redirect_url"))) {
      setRedirectUrl(query.get("redirect_url"));
    }
    if (!_.isNil(query.get("debug_mode"))) {
      setDebugMode(query.get("debug_mode"));
    }
  }, [location.search]);

  React.useEffect(() => {
    if (typeof publicData !== "undefined") {
      var tickets = publicData.accountTickets;

      if (publicData.creators) {
        publicData.creators.forEach((element) => {
          tickets = tickets + element.accountTickets;
        });
      }

      setAccountTickets(tickets);
    }
  }, [publicData]);

  function getSteps() {
    return ["Choose your account", "Backup your account", "Choose your dApp"];
  }

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <ChooseAccount
            setActiveStep={setActiveStep}
            setAccount={setAccount}
            referrerAccount={referrerAccount}
          />
        );
      case 1:
        return (
          <BackupAccount
            setActiveStep={setActiveStep}
            setAccount={setAccount}
            account={account}
            referrer={referrer}
            creator={creator}
            debugMode={debugMode}
          />
        );
      case 2:
        return <ChooseDApp account={account} redirectUrl={redirectUrl} />;
      default:
        return "Unknown step";
    }
  }

  return (
    <React.Fragment>
      <Card className={classes.card}>
        <CardContent>
          <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            spacing={2}
          >
            <Grid item xs={12}>
              {accountTickets === 0 && (
                <Chip
                  className={classes.chip}
                  color="primary"
                  label="Service Unavailable"
                  icon={<Icon>error</Icon>}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <Stepper alternativeLabel activeStep={activeStep}>
                {steps.map((label) => {
                  return (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
            </Grid>
            <Grid item xs={12}>
              {accountTickets === 0 ? (
                <Alert className={classes.alert} severity="info">
                  <AlertTitle>Service Unvailable</AlertTitle>
                  We are currently out of account creation tickets. Check back
                  later or use{" "}
                  <Link href="https://signup.hive.io" target="_blank">
                    signup.hive.io
                  </Link>{" "}
                  for other account creation options.
                </Alert>
              ) : (
                getStepContent(activeStep)
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </React.Fragment>
  );
};

export default CreateAccountPage;
