import {
  Flex,
  Modal,
  Form,
  message,
  Button,
  Input,
  Divider,
  Dropdown,
  Space,
  Tooltip,
  Checkbox,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { setDay } from "date-fns";
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";
import "./calendar.css";

const PatientSignUpModal = (props) => {
  const [form] = Form.useForm();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState({});
  const [days, setDays] = useState(props.days);
  const [shift1, setShift1] = useState(props.shift1);
  const [shift2, setShift2] = useState(props.shift2);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Assuming Monday as the first day of the week
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  let daysJSON = props.days;

  const selected = (e, day) => {
    setDays((prevDays) => ({
      ...prevDays,
      [day]: prevDays[day] === "true" ? "false" : "true",
    }));

    console.log(daysJSON);

    const element = document.getElementById(day);
    const bg = element.style.backgroundColor;

    element.style.backgroundColor =
      bg === "rgb(255, 230, 226)" ? "rgb(255,255,255)" : "rgb(255, 230, 226)";
  };
  useEffect(() => {
    setShift1(props.shift1);
    setShift2(props.shift2);

    setDays({ ...props.days });
    message.destroy();
  }, [props.shift1, props.shift2, props.days]);
  useEffect(() => {
    if (props.open) {
      form.resetFields();
      form.setFieldsValue({
        firstShift: props.shift1 || "",
        secondShift: props.shift2 || "",
      });
      setShift1(props.shift1);
      setShift2(props.shift2);

      setDays({ ...props.days });
      message.destroy();
    }
  }, [props.open, props.shift1, props.shift2, props.days]);

  const onFinish = async (value) => {
    setShift1(value.firstShift);
    props.onSubmitShift1(value.firstShift);
    setShift2(value.secondShift);
    props.onSubmitShift2(value.secondShift);

    setDays(daysJSON);
    props.onSubmitDays(days);

    const newSchedule = {};

    for (let i = 0; i < Object.keys(days).length; i++) {
      const key = Object.keys(days)[i];

      if (!newSchedule[key]) {
        newSchedule[key] = [];
      }

      if (days[key] === "true") {
        if (!newSchedule[key]) {
          newSchedule[key] = [];
        }

        let timeArray = [];
        const shiftTimes = [value.firstShift, value.secondShift];
        for (let j = 0; j < 2; j++) {
          const [start, end] = shiftTimes[j].split("-");

          const startHour = parseInt(start.split(":")[0]);
          const endHour = parseInt(end.split(":")[0]);
          const minutes = parseInt(start.split(":")[1]);

          let currentHour = startHour;
          let nextHour = currentHour + 1;

          while (currentHour != endHour) {
            if (currentHour > 12) {
              currentHour = currentHour - 12;
            }
            if (nextHour > 12) {
              nextHour = nextHour - 12;
            }
            let timestr =
              currentHour.toString() +
              ":" +
              minutes.toString() +
              "-" +
              nextHour.toString() +
              ":" +
              minutes.toString();

            if (minutes === 0) {
              timestr =
                currentHour.toString() +
                ":00" +
                "-" +
                nextHour.toString() +
                ":00";
            }
            timeArray.push(timestr);
            currentHour++;
            nextHour++;
          }
        }

        newSchedule[key] = [...newSchedule[key], ...timeArray];
      } else {
        if (!newSchedule[key]) {
          newSchedule[key] = [];
        }
      }
    }

    console.log(newSchedule);
    props.onSubmitSchedule(newSchedule);

    handleClose();
  };

  const onFail = () => {
    message.error("Submit Failed!");
  };

  const handleClose = () => {
    message.destroy();
    setDays({
      Sun: "false",
      Mon: "false",
      Tue: "false",
      Wed: "false",
      Thu: "false",
      Fri: "false",
      Sat: "false",
    });
    setShift1();
    setShift2();
    setSchedule({});
    props.handleClose();
  };

  return (
    <Modal
      open={props.open}
      footer={null}
      onCancel={handleClose}
      centered
      className="style-modal"
      width={950} // Width of the Modal
    >
      <Flex
        vertical
        justify="center"
        align="center"
        style={{
          border: "1px solid #999999",
          borderRadius: "16px",
          padding: "25px",
        }}
      >
        <h1 style={{ fontSize: "64px", color: "#333333" }}>Work Hours Form</h1>
        <Flex vertical style={{ width: "100%" }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFail}
            autoComplete="off"
          >
            <Form.Item>
              <div className="one-week-calendar">
                {calendarDays.map((day) => (
                  <div
                    id={format(day, "EEE")}
                    key={format(day, "EEE")}
                    className="calendar-day"
                    onClick={(e) => selected(e, format(day, "EEE"))}
                    style={{
                      backgroundColor:
                        days[format(day, "EEE")] === "true"
                          ? "rgb(255, 230, 226)"
                          : "rgb(255, 255, 255)",
                    }}
                  >
                    {format(day, "EEE")}
                  </div>
                ))}
              </div>
            </Form.Item>
            <Form.Item
              name="firstShift"
              label="First Shift"
              rules={[
                {
                  required: true,
                  message: "Please input your Work Hours for your First Shift!",
                },
                {
                  pattern: /^([1-9]|1[0-2]):([0-5][0-9])-([1-9]|1[0-2]):\2$/,
                  message: "Please input your Work Hours for your First Shift!",
                },
              ]}
              validateTrigger="onSubmit"
            >
              <Input
                placeholder="Enter your work hours for your first shift"
                style={{ height: "45px" }}
              />
            </Form.Item>
            <Form.Item
              name="secondShift"
              label="Second Shift"
              rules={[
                {
                  required: true,
                  message:
                    "Please input your Work Hours for your Second Shift!",
                },
                {
                  pattern: /^([1-9]|1[0-2]):([0-5][0-9])-([1-9]|1[0-2]):\2$/,
                  message:
                    "Please input your Work Hours for your Second Shift!",
                },
              ]}
              validateTrigger="onSubmit"
            >
              <Input
                placeholder="Enter your work hours for your second shift"
                style={{ height: "45px" }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  width: "100%",
                  border: "1px solid #999999",
                  borderRadius: "18px",
                  padding: "22px 0px",
                  backgroundColor: "#f09c96",
                }}
              >
                Submit Work Hours Form
              </Button>
            </Form.Item>
          </Form>
        </Flex>
      </Flex>
    </Modal>
  );
};

export default PatientSignUpModal;
