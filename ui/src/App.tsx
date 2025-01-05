import { useEffect } from 'react'
import './App.css'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { Container, Stack, Typography } from '@mui/material'

const MEGA_HERTZ = 1000000
const TEMP_CEL = 1000

function App() {
  const { sendMessage, lastMessage, readyState } = useWebSocket(`ws://${window.location.hostname}:8011/socket`);

  useEffect(() => {
    sendMessage("start")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];
  
  const data = JSON.parse(lastMessage?.data?.toString()||"{}")

  return (
    <Container maxWidth="md" style={{flex: 1, marginTop: 0}}>
      <Typography variant='h3' color="#c7053d" marginTop={4}>
        Pi Meter
      </Typography>
      <Typography variant='body1'>
        Board: {data?.board_model || ""}
      </Typography>
      <Typography variant='body1'>
        OS: {data?.os_pretty_name || ""}
      </Typography>
      <Typography variant='body1'>
        WebSocket: {connectionStatus}
      </Typography>
      <Stack spacing={2} marginTop={4} direction={{ sm: "column", md: "row" }}>
        <Stack direction="column" width={{ sm: "auto", md: "280px" }} style={styles.cards}>
          <Typography variant='h3' textAlign="center">
            {Math.fround((data?.cpu_current_frequency || 0) / MEGA_HERTZ).toFixed(2)}
          </Typography>
          <Typography variant='h5' textAlign="center">
            Cpu Freq
          </Typography>
        </Stack>
        <Stack direction="column" width={{ sm: "auto", md: "280px" }} style={styles.cards}>
          <Typography variant='h3' textAlign="center">
            {Math.fround((data?.soc_temp || 0) / TEMP_CEL).toFixed(1)}°C
          </Typography>
          <Typography variant='h5' textAlign="center">
            SoC Temp
          </Typography>
        </Stack>
        <Stack direction="column" width={{ sm: "auto", md: "280px" }} style={styles.cards}>
          <Typography variant='h3' textAlign="center">
            {data?.fan_speed || 0}
          </Typography>
          <Typography variant='h5' textAlign="center">
            Fan (RPM)
          </Typography>
        </Stack>
      </Stack>
    </Container>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const styles: any = {
  cards: {
    maxWidth: 280,
    backgroundColor: 'grey',
    borderRadius: 8,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginBottom: 8
  }
}

export default App
