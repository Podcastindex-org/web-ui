export interface BaseState {
    readonly loading: boolean
    readonly hydrated: boolean,
    readonly data: any[]
    readonly errors?: object
}