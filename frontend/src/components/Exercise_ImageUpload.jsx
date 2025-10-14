import React from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';

const props = {
  beforeUpload: file => {
    const isPNG = file.type === 'image/png';
    
    if (!isPNG) {
      message.error(`${file.name} is not a png file`);
    }
    return isPNG || Upload.LIST_IGNORE;
  },

  onChange: info => {
    console.log(info.fileList);
  },
};

const EIModal = () => (
  <Upload {...props}>
    <Button type="primary" htmlType="submit" justify="center" align="center"
      style={{width: "100%",  backgroundColor: "#F09C96" }}
      icon={<UploadOutlined />}>
        + Add Image
      </Button>
  </Upload>
);
export default EIModal;