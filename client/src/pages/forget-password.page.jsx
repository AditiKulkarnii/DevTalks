import React, { useState, useRef } from 'react';
import AnimationWrapper from '../common/page-animation';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const ChangePasswordForm = useRef();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/send-otp`, { email });
      toast.success('OTP sent successfully');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || !newPassword) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/reset-password`, {
        email,
        otp,
        newPassword,
      });
      navigate('/signin');
      toast.success('Password reset successfully');
      // Implement your login logic here
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <AnimationWrapper>
      <Toaster />
      <div className="h-screen bg-gradient-to-r from-sky-200 to-pink-100 flex flex-col items-center justify-start pt-12">
        <h1 className="text-4xl font-gelasio capitalize text-center font-semibold mb-12">Forgot Password ..?</h1>
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-4">{step === 1 ? 'Enter Email' : 'Reset Password'}</h1>
          <form ref={ChangePasswordForm} onSubmit={step === 1 ? handleSendOtp : handleResetPassword}>
            {step === 1 ? (
              <>
                <div className="relative mb-4">
                  <input
                    name="email"
                    type="email"
                    className="input-box"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    
                  />
                  <i className={"fa fi-rr-envelope input-icon"}></i>
                </div>
                <button className="btn-dark center mt-14" type="submit">
                  Send OTP
                </button>
              </>
            ) : (
              <>
                <div className="relative mb-4">
                  <input
                    name="otp"
                    type="text"
                    className="input-box"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                   <i className={"fa fi-rr-lock input-icon"}></i>
                </div>
                <div className="relative mb-4">
                  <input
                    name="newPassword"
                    type="password"
                    className="input-box"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                   <i className={"fa fi-rr-lock input-icon"}></i>
                </div>
                <button className="btn-dark center mt-14" type="submit">
                  Reset Password
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </AnimationWrapper>
  );
};

export default ForgetPassword;
