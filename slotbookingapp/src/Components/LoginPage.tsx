import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  useToast,
  Heading,
  SlideFade,
  ScaleFade,
} from "@chakra-ui/react";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpGenerated, setOtpGenerated] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const emailIsValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const generateOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5012/api/send-otp", {
        email,
      });
      setMessage(response.data.message);
      setOtpGenerated(true);
      toast({
        title: "OTP Generated",
        description: "Check your email for the OTP",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error generating OTP",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5012/api/verify-otp",
        { email, otp }
      );
      setMessage(response.data.message);
      if (response.data.verified) {
        localStorage.setItem("authToken", response.data.authToken);
        localStorage.setItem("email", response.data.email);

        const name = response.data.email.split("@")[0];

        toast({
          description: ` Hello ${name} you have successfully logged in`,
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
        navigate("/home");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error verifying OTP",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      h="100vh"
      bgGradient="linear(to-r, 500, pink.500)"
      color="white"
    >
      <SlideFade in={true} offsetY="20px">
        <Heading
          mb={4}
          fontSize="6xl"
          bgGradient="linear(to-l, yellow.400, orange.500)"
          bgClip="text"
        >
          Book your slot now!!
        </Heading>
      </SlideFade>
      <ScaleFade initialScale={0.9} in={true}>
        <VStack
          spacing={4}
          p={5}
          rounded="md"
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(10px)"
          boxShadow="2xl"
        >
          <Heading mb={4} color="black" fontWeight="bold">
            Login
          </Heading>
          <Text fontSize="md" color="gray.300" fontFamily="Arial">
            Just login using your email and OTP. No password required.
          </Text>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            bg="rgba(255, 255, 255, 0.8)"
            color="black"
            isInvalid={!emailIsValid(email) && email !== ""}
          />
          <Button
            onClick={generateOtp}
            isLoading={loading}
            colorScheme="blue"
            width="100%"
            isDisabled={!emailIsValid(email)}
          >
            Generate OTP
          </Button>
          <Input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            isDisabled={!otpGenerated}
            bg="rgba(255, 255, 255, 0.8)"
            color="black"
          />
          <Button
            onClick={verifyOtp}
            isLoading={loading}
            colorScheme="green"
            width="100%"
            isDisabled={!otpGenerated}
          >
            Verify OTP
          </Button>
          <Text color="whiteAlpha.900">{message}</Text>
        </VStack>
      </ScaleFade>
    </Box>
  );
};

export default LoginPage;
