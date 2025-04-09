import React, { useEffect, useState } from "react";
import { Popper, Tooltip, IconButton } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

interface CreateTooltipProps {
  target: Element | null;
  content: string;
  selector: string;
}

const CreateTooltip: React.FC<CreateTooltipProps> = ({
  target,
  content,
  selector,
}) => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  useEffect(() => {
    if (target) setAnchorEl(target);
  }, [target]);
  

  return (
    <Popper open anchorEl={anchorEl} placement="right">
      <Tooltip
        title={content}
        placement="bottom"
        arrow
        slotProps={{
          tooltip: {
            sx: {
              fontSize: "0.95rem",
              backgroundColor: "#333",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "8px",
              maxWidth: 300,
            },
          },
          arrow: {
            sx: {
              color: "#333",
            },
          },
        }}
      >
        <IconButton
          size="medium"
          data-tooltip-for={selector}
          sx={{
            backgroundColor: "#f5f5f5",
            ":hover":{
              backgroundColor:"#ccc",
            }
          }}
        >
          <HelpOutlineIcon sx={{ color: "#333" }} />
        </IconButton>
      </Tooltip>
    </Popper>
  );
};

export default CreateTooltip;
