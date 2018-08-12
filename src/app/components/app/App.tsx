import * as React from 'react';
import * as moment from 'moment';
import './App.css';
import { Form, Select, Input, Tooltip, DatePicker, Radio, Button, notification } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import locale from 'antd/lib/date-picker/locale/ru_RU';
import { RadioChangeEvent } from 'antd/lib/radio';

interface IState {
    actionsType: string;
    formValues?: {
        actionsType: string,
        depositAccount?: string,
        depositAmount: string,
        depositCurrency: string,
        depositDeadlineDate: moment.Moment,
        depositDeadlineDays: string,
        depositType: string
    }
}

interface IProps extends FormComponentProps {}

class AppContainer extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            actionsType: 'prolong',
            formValues: undefined
        }

        this.renderTooltip = this.renderTooltip.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
        this.onDaysChange = this.onDaysChange.bind(this);
        this.onChangeActionType = this.onChangeActionType.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.formatDays = this.formatDays.bind(this);
        this.setFormValues = this.setFormValues.bind(this);
        this.openNotification = this.openNotification.bind(this);
    }

    public componentDidMount() {
        this.props.form.validateFields();
    }

    public openNotification() {
        const key = `open${Date.now()}`;

        const message = (
            <React.Fragment>
                Вклад оформлен <span className="tooltip_cancel" onClick={() => {
                    this.setFormValues();
                    notification.close(key)
                }}>Cancel</span>
            </React.Fragment>
        )
        notification.open({
            message,
            description: undefined,
            key,
            duration: 155,
            onClose: close,
        });
    }

    public renderTooltip() {
        return (
            <React.Fragment>
                Дата окончания высчитывается<br/>
                автоматически, на основании срока<br />
                вклада в днях
            </React.Fragment>
        );
    }

    public onDateChange(date: moment.Moment, _dateString: string) {
        const diff = date.diff(moment(), 'days') + 1;
        
        this.props.form.setFieldsValue({
            depositDeadlineDays: diff
        });
    }

    public onDaysChange(e: React.SyntheticEvent<HTMLInputElement>) {
        const { value } = e.currentTarget;

        this.props.form.setFieldsValue({
            depositDeadlineDate: moment().add(value, 'days')
        });
    }
    
    public onChangeActionType(e: RadioChangeEvent) {
        const { value } = e.target as HTMLInputElement;
        this.setState({ actionsType: value }, () => {
            if (value !== 'prolong') {
                this.props.form.validateFields(['depositAccount'], {force: true}, () => void(0));
            }
        });
    }

    public handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
              console.log('Form submitted with values: ', values);
              this.setState({ formValues: values, actionsType: 'prolong' });
              this.props.form.resetFields();
              this.props.form.validateFields();
              this.openNotification();
            }
          });
    }

    public setFormValues() {
        if (this.state.formValues && this.state.formValues.depositAccount) {
            this.setState({ actionsType: this.state.formValues.actionsType }, () => {
                this.props.form.setFieldsValue(this.state.formValues);
            })
        } else {
            this.props.form.setFieldsValue(this.state.formValues);
        }
    }

    public handleCancel() {
        this.props.form.resetFields();
        this.props.form.validateFields();
        this.setState({ actionsType: 'prolong', formValues: undefined });
    }

    public formatCurrency(e: React.SyntheticEvent<HTMLInputElement>) {
        const { value } = e.target as HTMLInputElement;

        return value
            .replace(/[^\d.]/g, '')
            .replace(/(^[\d]{15})[\d]/g, '$1')
            .replace(/(\..*)\./g, '$1')
            .replace(/(\.[\d]{2})./g, '$1');
    }

    public formatDays(e: React.SyntheticEvent<HTMLInputElement>) {
        const { value } = e.target as HTMLInputElement;

        return value.replace(/[^\d.]/g, '');
    }

    public hasErrors(fieldsError: any) {
        return Object.keys(fieldsError).some(field => fieldsError[field]);
    }

    public render() {
        const { getFieldDecorator, getFieldsError, isFieldTouched, getFieldError } = this.props.form;

        const depositTypeError = isFieldTouched('depositType') && getFieldError('depositType');
        const depositCurrencyError = isFieldTouched('depositCurrency') && getFieldError('depositCurrency');
        const depositAmountError = isFieldTouched('depositAmount') && getFieldError('depositAmount');
        const depositDeadlineDaysError = isFieldTouched('depositDeadlineDays') && getFieldError('depositDeadlineDays');
        const depositAccountError = this.state.actionsType !== 'prolong' && isFieldTouched('depositAccount') && getFieldError('depositAccount');

        return (
            <div className="App">
                <h1 className="header">Согласуйте с клиентом и заполните параметры вклада</h1>
                <Form>
                    <div className="form">
                        <div className="form-row">
                            <div className="form-row-wrapper">
                                <span className="form__label">
                                    Вид вклада
                                </span>
                                <Form.Item validateStatus={depositTypeError ? 'error' : 'success'}>
                                    {getFieldDecorator('depositType', {
                                        rules: [{ required: true, message: ' ' }]
                                        })(
                                            <Select
                                                placeholder="Выберите вклад"
                                                style={{ width: 200 }}
                                            >
                                                <Select.Option value="term">Срочный</Select.Option>
                                                <Select.Option value="demand">Бессрочный</Select.Option>
                                            </Select>
                                        )
                                    }
                                </Form.Item>
                            </div>
                            <div className="form-row-wrapper">
                                <span className="form__label">
                                    Валюта
                                </span>
                                <Form.Item validateStatus={depositCurrencyError ? 'error' : 'success'}>
                                    {getFieldDecorator('depositCurrency', {
                                        rules: [{ required: true, message: ' ' }]
                                        })(
                                            <Select
                                                placeholder="Валюта"
                                                style={{ width: 200 }}
                                            >
                                                <Select.Option value="rub">Рубль</Select.Option>
                                                <Select.Option value="dol">Доллар</Select.Option>
                                                <Select.Option value="eur">Евро</Select.Option>
                                            </Select>
                                        )
                                    }
                                </Form.Item>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-row-wrapper">
                                <span className="form__label">
                                    Первоначальный взнос
                                </span>
                                <Form.Item
                                    label={String.fromCharCode(8381)}
                                    className="form__item_inline"
                                    validateStatus={depositAmountError ? 'error' : 'success'}
                                >
                                    {getFieldDecorator('depositAmount', {
                                        rules: [{ required: true }],
                                        getValueFromEvent: this.formatCurrency
                                        })(
                                            <Input
                                                type="text"
                                                placeholder="0.00"
                                            />
                                        )
                                    }
                                </Form.Item>
                            </div>
                        </div>

                        <div className="form-row">
                            <h2>
                                <Tooltip
                                    placement="right"
                                    overlayClassName="form__tooltip"
                                    title={this.renderTooltip()}
                                    // className="tooltip-wrapper"
                                >
                                    Срок вклада
                                    <span className="form__help" />
                                </Tooltip>
                            </h2>
                        </div>

                        <div className="form-row">
                            <div className="form-row-wrapper">
                                <span className="form__label">
                                    Дней
                                </span>
                                <Form.Item validateStatus={depositDeadlineDaysError ? 'error' : 'success'}>
                                    {getFieldDecorator('depositDeadlineDays', {
                                        rules: [{ required: true, message: ' ' }],
                                        getValueFromEvent: this.formatDays
                                        })(
                                            <Input
                                                placeholder=""
                                                style={{width: 100}}
                                                onChange={this.onDaysChange}
                                            />
                                        )
                                    }
                                </Form.Item>
                            </div>
                            <div className="form-row-wrapper">
                                <span className="form__label">
                                    Дата окончания
                                </span>
                                <Form.Item>
                                    {getFieldDecorator('depositDeadlineDate', {
                                        rules: [{ required: true, message: ' ' }],
                                        initialValue: moment()
                                        })(
                                            <DatePicker
                                                onChange={this.onDateChange}
                                                locale={locale}
                                                format='DD.MM.YYYY'
                                            />
                                        )
                                    }
                                </Form.Item>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-row-wrapper">
                                <h2>
                                    Действия после окончания срока вклада
                                </h2>
                                <Form.Item>
                                    {getFieldDecorator('actionsType', {
                                        rules: [{ required: true, message: ' ' }],
                                        initialValue: 'prolong'
                                        })(
                                            <Radio.Group onChange={this.onChangeActionType}>
                                                <Radio className="radio__item" value="prolong">Пролонгация</Radio>
                                                <Radio className="radio__item" value="transfer">Перевод средств на другой счет</Radio>
                                            </Radio.Group>
                                        )
                                    }
                                </Form.Item>
                                {this.state.actionsType !== 'prolong' ?
                                    <Form.Item validateStatus={depositAccountError ? 'error' : 'success'}>
                                        {getFieldDecorator('depositAccount', {
                                            rules: [{ required: true, message: ' ' }]
                                            })(
                                                <Select
                                                    placeholder="Счет не выбран"
                                                    style={{ width: 200 }}
                                                >
                                                    <Select.Option value="main">Основной **** 1488</Select.Option>
                                                    <Select.Option value="additional">Дополнительный **** 1613</Select.Option>
                                                    <Select.Option value="offshore">Оффшорный **** 9040</Select.Option>
                                                </Select>
                                            )
                                        }
                                    </Form.Item> :
                                    null
                                }
                            </div>
                        </div>
                    </div>
                    <div className="form-buttons">
                        <Button
                            className="form-buttons__button"
                            htmlType="button"
                            onClick={this.handleCancel}
                        >
                            Отменить
                        </Button>
                        <Button
                            className="form-buttons__button"
                            type="primary"
                            htmlType="submit"
                            disabled={this.hasErrors(getFieldsError())}
                            onClick={this.handleSubmit}
                        >
                            Подтвердить
                        </Button>
                    </div>
                </Form>
            </div>
        );
  }
}

export const App = Form.create()(AppContainer);
