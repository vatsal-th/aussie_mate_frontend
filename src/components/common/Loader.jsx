import React from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';

const Loader = ({
  message = 'Loading...',
  fullscreen = false,
  size = 56,
  thickness = 4,
}) => {
  return (
    <Box
      sx={{
        minHeight: fullscreen ? '100vh' : undefined,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: fullscreen ? 'grey.50' : 'transparent',
        px: fullscreen ? 2 : 0,
        py: fullscreen ? 6 : 0,
      }}
    >
      <Stack spacing={2} alignItems="center" maxWidth={360}>
        <CircularProgress size={size} thickness={thickness} />
        {message ? (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ fontWeight: 500, letterSpacing: 0.2 }}
          >
            {message}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
};

export default Loader;

