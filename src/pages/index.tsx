import Head from 'next/head';
import useSWR from 'swr';
import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';
import { AddRounded } from '@mui/icons-material';

export type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  businessName?: string;
};

export type Customers = Customer[];

export type ApiError = {
  code: string;
  message: string;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const body = await response.json();
  if (!response.ok) throw body;
  return body;
};

const Home = () => {
  const { data, error, isLoading, mutate } = useSWR<Customers, ApiError>(
    '/api/customers',
    fetcher
  );

  // States for dialog and form inputs
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');

  const handleAddCustomer = async () => {
    const newCustomer = {
      firstName,
      lastName,
      email,
      businessName: businessName ? businessName : undefined,
    };

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add customer');
      }

      // Revalidate SWR data so the table refreshes:
      await mutate();

      // Reset form and close dialog:
      setFirstName('');
      setLastName('');
      setEmail('');
      setBusinessName('');
      setOpen(false);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <Head>
        <title>Dwolla | Customers</title>
      </Head>
      <main>
        {/* Outer container with padding and gray background */}
        <Box sx={{ padding: 2, backgroundColor: '#f4f7fb', minHeight: '100vh' }}>
          {/* Table container centered; maxWidth: 960 */}
          <Box sx={{ maxWidth: 960, marginX: 'auto' }}>
            {isLoading && <Typography>Loading...</Typography>}
            {error && <Typography color="error">Error: {error.message}</Typography>}
            {data && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    {/* Header row with customer count and Add Customer button */}
                    <TableRow>
                      <TableCell colSpan={2} sx={{ borderBottom: 'none' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <Typography variant="subtitle1">
                            {data.length} Customers
                          </Typography>
                          <Button
                            variant="contained"
                            endIcon={<AddRounded />}
                            onClick={() => setOpen(true)}
                            sx={{
                              backgroundColor: '#000',
                              textTransform: 'none'
                            }}
                          >
                            Add Customer
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                    {/* Second header row with column titles */}
                    <TableRow>
                      <TableCell>
                        <strong>Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Email</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((customer) => (
                      <TableRow key={customer.email}>
                        <TableCell>
                          {customer.firstName} {customer.lastName}
                        </TableCell>
                        <TableCell>{customer.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>

        {/* Add Customer Dialog */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{
            sx: {
              width: 600,
              maxWidth: '80%',
              position: 'fixed',
              top: '50%',
              left: '50%',
              // You can comment out or adjust the transform if it's causing clipping
              transform: 'translate(-50%, calc(-50% - 85px))'
            }
          }}
        >
          <DialogTitle>Add Customer</DialogTitle>
          <DialogContent sx={{ overflow: 'visible' }}>
            {/* First row: First Name, Last Name, Business Name */}
            <Box sx={{ display: 'flex', gap: 1, marginBottom: 2 }}>
              <TextField
                autoFocus
                label="First Name*"
                variant="outlined"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Last Name*"
                variant="outlined"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Business Name"
                variant="outlined"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                fullWidth
              />
            </Box>
            {/* Second row: Email Address */}
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                label="Email Address*"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddCustomer}
              variant="contained"
              sx={{ backgroundColor: '#000', textTransform: 'none' }}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </main>
    </>
  );
};

export default Home;
