import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function createData(name, needToBuy, buyPrice, buyOrder) {
  return { name, needToBuy, buyPrice, buyOrder };
}

const getRows = (mats) => {
  if (mats == "Salvage") {
    return [
      createData('Electromechanical Hull Sheeting', "", "", ""),
      createData('Emergent Combat Analyzer', "", "", ""),
      createData('Fused Nanomechanical Engines', "", "", ""),
      createData('Heuristic Selfassemblers', "", "", ""),
      createData('Melted Nanoribbons', "", "", ""),
      createData('Modified Fluid Router', "", "", ""),
      createData('Neurovisual Input Matrix', "", "", ""),
      createData('Powdered C-540 Graphite', "", "", ""),
      createData('Resonance Calibration Matrix', "", "", ""),
    ]
  }
  if (mats == "Gas") {
    return [
      createData('Fullerite-C28', "", "", ""),
      createData('Fullerite-C32', "", "", ""),
      createData('Fullerite-C320', "", "", ""),
      createData('Fullerite-C50', "", "", ""),
      createData('Fullerite-C60', "", "", ""),
      createData('Fullerite-C70', "", "", ""),
      createData('Fullerite-C72', "", "", ""),
      createData('Fullerite-C84', "", "", "")
    ]
  }
  if (mats == "Fuel Blocks") {
    return [
      createData('Helium Fuel Block', "", "", ""),
      createData('Hydrogen Fuel Block', "", "", ""),
      createData('Nitrogen Fuel Block', "", "", ""),
      createData('Oxygen Fuel Block', "", "", "")
    ]
  }
  if (mats == "Minerals") {
    return [
      createData('Isogen', "", "", ""),
      createData('Mexallon', "", "", ""),
      createData('Nocxium', "", "", ""),
      createData('Pyerite', "", "", ""),
      createData('Tritanium', "", "", ""),
      createData('Zydrine', "", "", ""),
    ]
  }
}

export default function BasicTable(props) {
  const mats = props.mats;
  const rows = getRows(mats);
  return (
    <Table aria-label="simple table" size="small">
      <TableHead>
        <TableRow>
          <TableCell>{mats}</TableCell>
          <TableCell align="right">Need to Buy</TableCell>
          <TableCell align="right">Buy Price</TableCell>
          <TableCell align="right">Buy Order</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={row.name}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          >
            <TableCell component="th" scope="row">
              {row.name}
            </TableCell>
            <TableCell align="right">{row.calories}</TableCell>
            <TableCell align="right">{row.fat}</TableCell>
            <TableCell align="right">{row.carbs}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}