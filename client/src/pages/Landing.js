import { Operation, Descriptions, History } from "../components";
import MainWrapper from "../assets/wrappers/MainWrapper";
import { useAppContext } from "../context/appContext";
import { useEffect } from "react";

const Landing = () => {
  const { userName, isAdmin, setupCiphers } = useAppContext();

  useEffect(() => {
    setupCiphers();
    // eslint-disable-next-line
  }, []);

  return (
    <MainWrapper className="container">
      <Operation />
      {!isAdmin && userName && <History />}
      <Descriptions />
    </MainWrapper>
  );
};

export default Landing;
