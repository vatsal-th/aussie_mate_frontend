import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronDown, UserRound, XCircle } from 'lucide-react';
import { Button, PageHeader, TierBadge } from '../../components';
import { paymentService, handlePaymentError } from '../../services/paymentService';
import { calculatePayoutAmounts } from '../../utils/paymentCalculations';
import StarIcon from '../../assets/rating.svg';

const ConfirmYourCleanerPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const location = useLocation();

  const cleanerData = location.state?.cleanerData;
  const quoteData = location.state?.quoteData;

  const finalCleanerData = quoteData
    ? {
      id:
        quoteData.cleanerId?._id ||
        quoteData.cleanerId?.id ||
        quoteData.cleanerId ||
        'Unknown',
      name: quoteData.cleanerId
        ? `${quoteData.cleanerId.firstName || ''} ${quoteData.cleanerId.lastName || ''
          }`.trim() ||
        `Cleaner #${(
          quoteData.cleanerId._id ||
          quoteData.cleanerId.id ||
          quoteData.cleanerId
        ).slice(-4)}`
        : 'Cleaner',
      rating:
        quoteData.cleanerId?.averageRating ??
        quoteData.cleanerId?.rating ??
        0,
      tier: quoteData.cleanerId?.tier || 'none',
      baseQuote: quoteData.basePrice || quoteData.price || 0,
      total: quoteData.totalPrice || quoteData.price || 0,
    }
    : cleanerData || null;


  useEffect(() => {
    if (!finalCleanerData) {
      navigate('/my-jobs');
    }
  }, [finalCleanerData, navigate]);

  if (!finalCleanerData) return null;

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showOnlineBreakdown, setShowOnlineBreakdown] = useState(false);

  const onlinePaymentPercentage = 10;
  const onlineNowAmount = Math.round(
    finalCleanerData.total * (onlinePaymentPercentage / 100)
  );
  const cashAmount = finalCleanerData.total - onlineNowAmount;

  // FIXED: Correct commission/GST/cleaner payout calculation
  const payoutAmounts = calculatePayoutAmounts(finalCleanerData.total);

  const handleProceedToPay = async () => {
    try {
      setProcessing(true);
      setError(null);

      const response = await paymentService.createPayment(
        jobId,
        'online',
        true,
        'automatic'
      );

      if (response.success && response.data.url) {
        window.location.href = response.data.url;
      } else {
        setError('Failed to initialize payment. Please try again.');
        setProcessing(false);
      }
    } catch (err) {
      setError(handlePaymentError(err));
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-4 py-4">
        <PageHeader
          title="Confirm Your Cleaner"
          onBack={() => navigate(-1)}
          className="mb-6"
          titleClassName="text-xl font-semibold text-primary-500"
        />

        {/* Cleaner Card */}
        <div className="bg-white rounded-2xl shadow-custom p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <UserRound className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>

            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-primary-500 mb-3">
                {finalCleanerData.name}
              </h2>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#FFF2DE] px-2 py-1 rounded-full">
                  <img src={StarIcon} alt="Rating" className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium text-primary-500">
                    {finalCleanerData.rating}
                  </span>
                </div>
                <TierBadge tier={finalCleanerData.tier} />
              </div>
            </div>
          </div>
        </div>

        {/* Quote Summary */}
        <div className="bg-white rounded-2xl shadow-custom p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-primary-500 mb-4">
            Quote Summary
          </h3>

          <div className="space-y-3">
            <div>
              <span className="text-sm text-primary-200 font-medium">
                Base Quote:{' '}
                <span className="text-sm font-semibold text-primary-500">
                  ${finalCleanerData.baseQuote}
                </span>
              </span>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <span className="text-base font-semibold text-primary-500">
                Total:{' '}
                <span className="text-lg font-bold text-primary-500">
                  ${finalCleanerData.total}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl shadow-custom p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-primary-500 mb-4">
            Online Payment
          </h3>

          <div className="space-y-3">
            <p className="text-sm text-primary-200 font-medium">
              Pay securely online to confirm your booking instantly.
            </p>

            <Button
              onClick={() => setShowOnlineBreakdown(!showOnlineBreakdown)}
              variant="link"
              size="sm"
              className="flex items-center gap-1 text-sm text-primary-600 font-medium"
            >
              View Breakdown
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showOnlineBreakdown ? 'rotate-180' : ''
                  }`}
              />
            </Button>

            {showOnlineBreakdown && (
              <div className="mt-2 space-y-3 text-sm text-primary-200 font-medium">

                {/* Commission */}
                <div className="flex justify-between">
                  <span>Commission (15%):</span>
                  <span className="font-semibold text-primary-500">
                    ${payoutAmounts.adminCommission}
                  </span>
                </div>


                {/* GST */}
                <div className="flex justify-between">
                  <span>GST (10%):</span>
                  <span className="font-semibold text-primary-500">
                    ${payoutAmounts.gstAmount}
                  </span>
                </div>

                {/* Cleaner payout */}
                <div className="flex justify-between">
                  <span>Cleaner Payout:</span>
                  <span className="font-semibold text-primary-500">
                    ${payoutAmounts.cleanerAmount}
                  </span>
                </div>

                <p className="text-xs text-primary-300 font-medium">
                  The remaining balance will be charged automatically after the job is completed.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Error</h4>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleProceedToPay}
            size="md"
            className="px-4 py-3 mb-6"
            loading={processing}
            disabled={processing}
          >
            {`Confirm & Pay $${finalCleanerData.total}`}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-primary-200">
            All payments are secured. Your cleaner's contact details will unlock once booking
            is confirmed.
          </p>
        </div>
      </div>
    </>
  );
};

export default ConfirmYourCleanerPage;