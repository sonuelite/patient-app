import {payAppointment} from '../src/network/api';
import {apiClient} from '../src/network/client';

jest.mock('../src/network/client', () => ({
  apiClient: {post: jest.fn()}, publicClient: {},
}));

const input = {
  billingId: 'BILL202609230001', amountPaid: 500,
  paymentMode: 'UPI', paymentDetails: 'UPI-TXN-98765',
};

beforeEach(() => jest.clearAllMocks());

test('submits the bill, amount, mode and transaction reference', async () => {
  jest.mocked(apiClient.post).mockResolvedValue({data: {success: true}});
  await expect(payAppointment(input)).resolves.toBeUndefined();
  expect(apiClient.post).toHaveBeenCalledWith('/api/v1/patient/payAppointment', input);
});

test('surfaces payment rejection so the screen can stay on payment', async () => {
  jest.mocked(apiClient.post).mockResolvedValue({data: {success: false, message: 'Payment declined'}});
  await expect(payAppointment(input)).rejects.toThrow('Payment declined');
});

test('does not treat an unrecognized response as successful payment', async () => {
  jest.mocked(apiClient.post).mockResolvedValue({data: {}});
  await expect(payAppointment(input)).rejects.toThrow('Unable to pay for appointment');
});
